import type { VehicleListing } from "@/types/content";
import {
  isPriceStoreAvailable,
  readPublishedPrices,
  rollbackPublishedPrices,
  writePublishedPrices,
} from "@/lib/priceStore";
import { mockVehicleListings } from "@/data/vehicles";
import { parseVehicleSheet, vehicleDocumentId, vehicleKey, type SkipReason } from "@/lib/vehicleSheet";

/**
 * Receives the price sheet from the Google Sheet's "Publicar precios" menu
 * (see docs/apps-script/PublicarPrecios.gs) and publishes it to the site.
 *
 * Body: { rows: string[][], dryRun?: boolean, publishedBy?: string, action?: "publish" | "rollback", force?: boolean }
 *
 * The Sheet always calls with dryRun first, shows the operator what will
 * change, and only sends the real publish once they confirm.
 */

const MAX_ROWS = 5000;
/** Refuse a publish that would drop more than this share of vehicles, unless forced. */
const SHRINK_GUARD = 0.5;

function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const COMPARED_FIELDS: (keyof VehicleListing)[] = [
  "vehicleType",
  "motor",
  "battery",
  "maxSpeed",
  "range",
  "features",
  "priceMin",
  "priceMax",
  "source",
];

const SKIP_LABELS: Record<SkipReason, string> = {
  "brand-header": "Encabezados de marca",
  "empty-row": "Filas vacías",
  "missing-brand": "Sin Marca",
  "missing-model": "Sin Modelo",
  "unknown-category": "Categoría desconocida",
  duplicate: "Repetidos",
};

/** Skip reasons that are just the sheet's layout, not something to fix. */
const EXPECTED_SKIPS = new Set<SkipReason>(["brand-header", "empty-row"]);

export async function POST(request: Request) {
  const expected = process.env.PRICES_PUBLISH_SECRET;
  if (!expected) {
    return json({ ok: false, error: "PRICES_PUBLISH_SECRET no está configurada en el servidor." }, 503);
  }
  const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!provided || !secretMatches(provided, expected)) {
    return json({ ok: false, error: "Clave de publicación incorrecta." }, 401);
  }

  if (!(await isPriceStoreAvailable())) {
    return json({ ok: false, error: "El almacenamiento de precios (PRICES_KV) no está conectado en Cloudflare." }, 503);
  }

  let body: {
    rows?: unknown;
    dryRun?: boolean;
    publishedBy?: string;
    action?: string;
    force?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Cuerpo de la petición inválido." }, 400);
  }

  if (body.action === "rollback") {
    if (body.dryRun) {
      return json({ ok: true, message: "Listo para restaurar la versión anterior." });
    }
    const restored = await rollbackPublishedPrices();
    if (!restored) return json({ ok: false, error: "No hay una versión anterior para restaurar." }, 404);
    return json({
      ok: true,
      message: `Restaurada la versión publicada el ${restored.publishedAt} (${restored.vehicles.length} vehículos).`,
    });
  }

  const rows = body.rows;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_ROWS || !rows.every(Array.isArray)) {
    return json({ ok: false, error: "No llegaron filas válidas desde el Sheet." }, 400);
  }
  const stringRows = (rows as unknown[][]).map((row) => row.map((value) => (value == null ? "" : String(value))));

  let parsed;
  try {
    parsed = parseVehicleSheet(stringRows);
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "No se pudo leer el Sheet." }, 422);
  }

  const vehicles: VehicleListing[] = parsed.vehicles.map((vehicle) => ({
    _id: vehicleDocumentId(vehicle.brand, vehicle.model).replace(/^vehicle-/, ""),
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
  }));

  if (vehicles.length === 0) {
    return json({ ok: false, error: "El Sheet no tiene ningún vehículo válido (se necesitan Marca, Modelo y Categoría)." }, 422);
  }

  // Compare against what the site shows right now.
  const current = await readPublishedPrices();
  const baseline = current?.vehicles ?? mockVehicleListings;
  const before = new Map(baseline.map((v) => [vehicleKey(v.brand, v.model), v]));
  const after = new Map(vehicles.map((v) => [vehicleKey(v.brand, v.model), v]));

  const added: string[] = [];
  const changed: string[] = [];
  const removed: string[] = [];
  for (const [key, vehicle] of after) {
    const old = before.get(key);
    if (!old) {
      added.push(`${vehicle.brand} ${vehicle.model}`);
    } else if (COMPARED_FIELDS.some((field) => (old[field] ?? "") !== (vehicle[field] ?? ""))) {
      changed.push(`${vehicle.brand} ${vehicle.model}`);
    }
  }
  for (const [key, vehicle] of before) {
    if (!after.has(key)) removed.push(`${vehicle.brand} ${vehicle.model}`);
  }

  const problems = parsed.skipped
    .filter((row) => !EXPECTED_SKIPS.has(row.reason))
    .map((row) => `Fila ${row.rowNumber}: ${row.detail}`);
  const problemCounts: Record<string, number> = {};
  for (const row of parsed.skipped) {
    if (EXPECTED_SKIPS.has(row.reason)) continue;
    problemCounts[SKIP_LABELS[row.reason]] = (problemCounts[SKIP_LABELS[row.reason]] ?? 0) + 1;
  }

  const shrinksTooMuch = baseline.length > 0 && vehicles.length < baseline.length * SHRINK_GUARD;

  const summary = {
    total: vehicles.length,
    previousTotal: baseline.length,
    previousPublishedAt: current?.publishedAt ?? null,
    added,
    changed,
    removed,
    problems,
    problemCounts,
    blocked: shrinksTooMuch && !body.force,
  };

  if (body.dryRun) {
    return json({ ok: true, dryRun: true, summary });
  }

  if (summary.blocked) {
    return json(
      {
        ok: false,
        error: `La publicación dejaría ${vehicles.length} vehículos (antes ${baseline.length}). Se bloqueó por seguridad.`,
        summary,
      },
      409
    );
  }

  const publishedAt = new Date().toISOString();
  await writePublishedPrices({
    publishedAt,
    publishedBy: typeof body.publishedBy === "string" ? body.publishedBy.slice(0, 200) : null,
    vehicles,
  });

  return json({ ok: true, dryRun: false, publishedAt, summary });
}
