import type { VehicleType } from "@/types/content";

/**
 * Parsing for the "EVirexion_Guia_de_Precios" sheet.
 *
 * The sheet is laid out for humans, not machines:
 * - Two merged banner rows and a blank row sit above the real header row.
 * - Each brand gets a merged section header row ("BYD") where only the first
 *   column is populated, before that brand's vehicle rows.
 * - There is a blank spacer column between "Precio Sugerido (COP)" and
 *   "Fuente", so column positions are read from the header row by name rather
 *   than hardcoded, and stay correct if columns move.
 *
 * A row counts as a vehicle only when both Marca and Modelo are non-empty.
 * Everything else is skipped and reported rather than throwing.
 */

export type SkipReason =
  | "brand-header"
  | "empty-row"
  | "missing-brand"
  | "missing-model"
  | "unknown-category"
  | "duplicate";

export interface SkippedRow {
  rowNumber: number;
  reason: SkipReason;
  detail: string;
}

export interface ParsedVehicle {
  rowNumber: number;
  brand: string;
  model: string;
  vehicleType: VehicleType;
  motor: string;
  battery: string;
  maxSpeed: string;
  range: string;
  features: string;
  priceMin: number | null;
  priceMax: number | null;
  source: string;
}

export interface ParseResult {
  vehicles: ParsedVehicle[];
  skipped: SkippedRow[];
  headerRowNumber: number;
}

/** Lowercase, strip accents and all whitespace, for tolerant header/category matching. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

const CATEGORY_MAP: Record<string, VehicleType> = {
  carro: "car",
  auto: "car",
  automovil: "car",
  camioneta: "car",
  bus: "bus",
  buseta: "bus",
  "moto/scooter": "motorcycle",
  moto: "motorcycle",
  motocicleta: "motorcycle",
  "bicicletaelectrica": "e-bike",
  "bicielectrica": "e-bike",
  bicicleta: "e-bike",
  ebike: "e-bike",
  "patinetaelectrica": "scooter",
  patineta: "scooter",
};

/** Column header (normalized) -> field name. */
const COLUMN_MAP: Record<string, keyof ColumnIndex> = {
  marca: "brand",
  modelo: "model",
  categoria: "category",
  tipo: "category",
  motor: "motor",
  bateria: "battery",
  velocidadmaxima: "maxSpeed",
  velocidadmax: "maxSpeed",
  velocidad: "maxSpeed",
  autonomia: "range",
  caracteristicasprincipales: "features",
  caracteristicas: "features",
  "preciosugerido(cop)": "price",
  preciosugerido: "price",
  precio: "price",
  fuente: "source",
};

interface ColumnIndex {
  brand: number;
  model: number;
  category: number;
  motor: number;
  battery: number;
  maxSpeed: number;
  range: number;
  features: number;
  price: number;
  source: number;
}

const EMPTY_COLUMNS: ColumnIndex = {
  brand: -1,
  model: -1,
  category: -1,
  motor: -1,
  battery: -1,
  maxSpeed: -1,
  range: -1,
  features: -1,
  price: -1,
  source: -1,
};

function cell(row: string[], index: number): string {
  if (index < 0) return "";
  return (row[index] ?? "").toString().trim();
}

/** Parses one price token: "$79M" -> 79000000, "$4.3M" -> 4300000. */
function parseMoneyToken(token: string): number | null {
  const cleaned = token
    .replace(/\$/g, "")
    .replace(/cop/gi, "")
    .replace(/\s/g, "");
  if (!cleaned) return null;

  // The sheet writes every price with an "M" (millions) suffix; there the dot
  // is a decimal separator ("4.3M" = 4,300,000).
  const millions = /^([\d.,]+)m$/i.exec(cleaned);
  if (millions) {
    const value = Number.parseFloat(millions[1].replace(/,/g, "."));
    return Number.isFinite(value) ? Math.round(value * 1_000_000) : null;
  }

  // Otherwise treat dots/commas as thousands separators ("79.000.000").
  const digits = cleaned.replace(/[.,]/g, "");
  if (!/^\d+$/.test(digits)) return null;
  const value = Number.parseInt(digits, 10);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parses the "Precio Sugerido (COP)" cell, which is either a range
 * ("$79M – $85M"), a single value ("$2.1M"), or unavailable ("N/D").
 */
export function parsePriceRange(raw: string): { min: number | null; max: number | null } {
  const text = (raw ?? "").trim();
  if (!text || /^n\/?\.?d\.?$/i.test(text) || /^[-–—]+$/.test(text)) {
    return { min: null, max: null };
  }

  const tokens = text
    .split(/\s*(?:–|—|-|\ba\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const values = tokens.map(parseMoneyToken).filter((value): value is number => value !== null);
  if (values.length === 0) return { min: null, max: null };
  if (values.length === 1) return { min: values[0], max: values[0] };
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function mapCategory(raw: string): VehicleType | null {
  const key = normalize(raw);
  if (!key) return null;
  return CATEGORY_MAP[key] ?? null;
}

/** Finds the header row (the one carrying both Marca and Modelo) and maps columns. */
function findHeader(rows: string[][]): { index: number; columns: ColumnIndex } | null {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const normalized = row.map((value) => normalize(String(value ?? "")));
    if (!normalized.includes("marca") || !normalized.includes("modelo")) continue;

    const columns: ColumnIndex = { ...EMPTY_COLUMNS };
    normalized.forEach((header, columnIndex) => {
      const field = COLUMN_MAP[header];
      // First match wins, so a stray repeated header later can't clobber it.
      if (field && columns[field] === -1) {
        columns[field] = columnIndex;
      }
    });
    return { index: i, columns };
  }
  return null;
}

export function parseVehicleSheet(rows: string[][]): ParseResult {
  const header = findHeader(rows);
  if (!header) {
    throw new Error(
      'No se encontró la fila de encabezados en el Sheet (se esperaban columnas "Marca" y "Modelo").'
    );
  }

  const { columns } = header;
  const vehicles: ParsedVehicle[] = [];
  const skipped: SkippedRow[] = [];
  const seen = new Map<string, number>();

  for (let i = header.index + 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const rowNumber = i + 1; // 1-based, matches what the operator sees in Sheets

    const brand = cell(row, columns.brand);
    const model = cell(row, columns.model);

    if (!brand && !model) {
      const hasAnything = row.some((value) => String(value ?? "").trim() !== "");
      if (hasAnything) {
        skipped.push({ rowNumber, reason: "missing-brand", detail: "Fila sin Marca ni Modelo." });
      } else {
        skipped.push({ rowNumber, reason: "empty-row", detail: "Fila vacía." });
      }
      continue;
    }

    if (brand && !model) {
      // The merged per-brand section header, e.g. a row that only says "BYD".
      const onlyBrandColumn = row.every(
        (value, index) => index === columns.brand || String(value ?? "").trim() === "" || String(value ?? "").trim() === brand
      );
      skipped.push({
        rowNumber,
        reason: onlyBrandColumn ? "brand-header" : "missing-model",
        detail: onlyBrandColumn
          ? `Encabezado de marca "${brand}".`
          : `Fila de "${brand}" sin Modelo.`,
      });
      continue;
    }

    if (!brand && model) {
      skipped.push({ rowNumber, reason: "missing-brand", detail: `Fila "${model}" sin Marca.` });
      continue;
    }

    const vehicleType = mapCategory(cell(row, columns.category));
    if (!vehicleType) {
      const rawCategory = cell(row, columns.category);
      skipped.push({
        rowNumber,
        reason: "unknown-category",
        detail: rawCategory
          ? `${brand} ${model}: categoría desconocida "${rawCategory}".`
          : `${brand} ${model}: sin categoría.`,
      });
      continue;
    }

    const key = `${normalize(brand)}|${normalize(model)}`;
    const firstSeenRow = seen.get(key);
    if (firstSeenRow) {
      skipped.push({
        rowNumber,
        reason: "duplicate",
        detail: `${brand} ${model}: repetido (ya aparece en la fila ${firstSeenRow}).`,
      });
      continue;
    }
    seen.set(key, rowNumber);

    const { min, max } = parsePriceRange(cell(row, columns.price));

    vehicles.push({
      rowNumber,
      brand,
      model,
      vehicleType,
      motor: cell(row, columns.motor),
      battery: cell(row, columns.battery),
      maxSpeed: cell(row, columns.maxSpeed),
      range: cell(row, columns.range),
      features: cell(row, columns.features),
      priceMin: min,
      priceMax: max,
      source: cell(row, columns.source),
    });
  }

  return { vehicles, skipped, headerRowNumber: header.index + 1 };
}

/** Stable key used to match a sheet row to an existing Sanity document. */
export function vehicleKey(brand: string, model: string): string {
  return `${normalize(brand)}|${normalize(model)}`;
}

/** Deterministic document id, so a re-run can't create duplicates. */
export function vehicleDocumentId(brand: string, model: string): string {
  const slug = `${brand}-${model}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `vehicle-${slug}`;
}
