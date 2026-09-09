import type { SanityClient } from "@sanity/client";
import { fetchSheetData } from "./googleSheets";
import { getSanityWriteClient } from "./sanity/client";
import {
  parseVehicleSheet,
  vehicleDocumentId,
  vehicleKey,
  type ParsedVehicle,
  type SkipReason,
  type SkippedRow,
} from "./vehicleSheet";

/** Fields the sync owns. Anything else on the document is left untouched. */
const SYNCED_FIELDS = [
  "brand",
  "model",
  "vehicleType",
  "motor",
  "battery",
  "maxSpeed",
  "range",
  "features",
  "priceMin",
  "priceMax",
  "currency",
  "source",
] as const;

type SyncedField = (typeof SYNCED_FIELDS)[number];
type VehicleFields = Record<SyncedField, string | number | null>;

interface ExistingDocument extends Partial<VehicleFields> {
  _id: string;
}

/**
 * Published documents only. A write token also sees drafts, and a draft carries
 * the same brand/model as its published version — matching both would make the
 * same vehicle collide with itself and patch whichever landed in the map last.
 */
const existingVehiclesQuery = `*[_type == "vehicleListing" && !(_id in path("drafts.**"))]{
  _id, brand, model, vehicleType, motor, battery, maxSpeed, range, features,
  priceMin, priceMax, currency, source
}`;

export interface SyncChange {
  label: string;
  rowNumber: number;
  /** Only present for updates: which fields actually differed. */
  fields?: string[];
}

export interface SyncSummary {
  dryRun: boolean;
  sheetTitle: string;
  totalRows: number;
  validRows: number;
  added: SyncChange[];
  updated: SyncChange[];
  unchanged: number;
  skipped: {
    total: number;
    byReason: Partial<Record<SkipReason, number>>;
    rows: SkippedRow[];
  };
  durationMs: number;
}

function toFields(vehicle: ParsedVehicle): VehicleFields {
  return {
    brand: vehicle.brand,
    model: vehicle.model,
    vehicleType: vehicle.vehicleType,
    motor: vehicle.motor,
    battery: vehicle.battery,
    maxSpeed: vehicle.maxSpeed,
    range: vehicle.range,
    features: vehicle.features,
    priceMin: vehicle.priceMin,
    priceMax: vehicle.priceMax,
    currency: "COP",
    source: vehicle.source,
  };
}

/** Treats missing/null/"" as equivalent so cosmetic gaps don't count as changes. */
function isEqual(a: unknown, b: unknown): boolean {
  const normalizeValue = (value: unknown) => {
    if (value === undefined || value === null) return null;
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }
    return value;
  };
  return normalizeValue(a) === normalizeValue(b);
}

function changedFields(existing: ExistingDocument, next: VehicleFields): SyncedField[] {
  return SYNCED_FIELDS.filter((field) => !isEqual(existing[field], next[field]));
}

/** Sanity caps mutations per transaction; chunking keeps large syncs safe. */
const MUTATIONS_PER_TRANSACTION = 50;

async function commitInChunks(
  client: SanityClient,
  mutations: ((tx: ReturnType<SanityClient["transaction"]>) => void)[]
): Promise<void> {
  for (let i = 0; i < mutations.length; i += MUTATIONS_PER_TRANSACTION) {
    const chunk = mutations.slice(i, i + MUTATIONS_PER_TRANSACTION);
    const transaction = client.transaction();
    for (const apply of chunk) apply(transaction);
    await transaction.commit({ visibility: "async" });
  }
}

export interface SyncOptions {
  spreadsheetId?: string;
  gid?: string;
  /** Parse and diff, but write nothing. */
  dryRun?: boolean;
}

/**
 * Reads the vehicle master sheet and reconciles it into Sanity:
 * new rows are created, changed rows patched, identical rows left alone.
 * Malformed rows are skipped and reported rather than aborting the run.
 */
export async function syncVehiclesFromSheet(options: SyncOptions = {}): Promise<SyncSummary> {
  const startedAt = Date.now();

  const spreadsheetId = options.spreadsheetId || process.env.VEHICLES_SPREADSHEET_ID;
  const gid = options.gid ?? process.env.VEHICLES_SHEET_GID;

  if (!spreadsheetId) {
    throw new Error("VEHICLES_SPREADSHEET_ID no está configurada en el servidor.");
  }

  const client = getSanityWriteClient();
  if (!client) {
    throw new Error(
      "Sanity no está conectado para escritura. Configura NEXT_PUBLIC_SANITY_PROJECT_ID y SANITY_API_WRITE_TOKEN."
    );
  }

  const { sheetTitle, rows } = await fetchSheetData({ spreadsheetId, gid });
  const { vehicles, skipped } = parseVehicleSheet(rows);

  const existingDocs = await client.fetch<ExistingDocument[]>(existingVehiclesQuery);
  const existingByKey = new Map<string, ExistingDocument>();
  for (const doc of existingDocs) {
    if (!doc.brand || !doc.model) continue;
    existingByKey.set(vehicleKey(String(doc.brand), String(doc.model)), doc);
  }

  const added: SyncChange[] = [];
  const updated: SyncChange[] = [];
  let unchanged = 0;
  const mutations: ((tx: ReturnType<SanityClient["transaction"]>) => void)[] = [];

  for (const vehicle of vehicles) {
    const label = `${vehicle.brand} ${vehicle.model}`;
    const fields = toFields(vehicle);
    const existing = existingByKey.get(vehicleKey(vehicle.brand, vehicle.model));

    if (!existing) {
      added.push({ label, rowNumber: vehicle.rowNumber });
      if (!options.dryRun) {
        const id = vehicleDocumentId(vehicle.brand, vehicle.model);
        // createIfNotExists + patch rather than createOrReplace: if a document
        // already sits on this id (e.g. someone renamed its brand by hand, so
        // the brand+model lookup above missed it), this brings it back in line
        // with the sheet instead of wiping any fields the sync doesn't own.
        mutations.push((tx) =>
          tx
            .createIfNotExists({ _id: id, _type: "vehicleListing", ...fields })
            .patch(id, { set: fields })
        );
      }
      continue;
    }

    const diff = changedFields(existing, fields);
    if (diff.length === 0) {
      unchanged += 1;
      continue;
    }

    updated.push({ label, rowNumber: vehicle.rowNumber, fields: diff });
    if (!options.dryRun) {
      const patch = Object.fromEntries(diff.map((field) => [field, fields[field]]));
      mutations.push((tx) => tx.patch(existing._id, { set: patch }));
    }
  }

  if (mutations.length > 0) {
    await commitInChunks(client, mutations);
  }

  const byReason: Partial<Record<SkipReason, number>> = {};
  for (const row of skipped) {
    byReason[row.reason] = (byReason[row.reason] ?? 0) + 1;
  }

  return {
    dryRun: Boolean(options.dryRun),
    sheetTitle,
    totalRows: rows.length,
    validRows: vehicles.length,
    added,
    updated,
    unchanged,
    skipped: { total: skipped.length, byReason, rows: skipped },
    durationMs: Date.now() - startedAt,
  };
}
