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
  /** The price cell exactly as written, for reporting cells that couldn't be read. */
  priceRaw: string;
  source: string;
}

export interface ParseResult {
  vehicles: ParsedVehicle[];
  skipped: SkippedRow[];
  headerRowNumber: number;
  /** Header label of the column read as price, or null if none was found. */
  priceHeader: string | null;
  headerLabels: string[];
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

const MILLIONS_SUFFIX = /^(mm|millones|millon|mill|mlls?|m)$/;

/** Turns one number as written ("79", "79,5", "79.000.000") into a plain number. */
function readNumber(text: string, millions: boolean): number | null {
  let value: number;
  if (/^\d{1,3}([.,]\d{3})+$/.test(text)) {
    // Thousands separators: "79.000.000" / "79,000,000" — and "$1.200M" is 1,200 millions.
    value = Number.parseInt(text.replace(/[.,]/g, ""), 10);
  } else {
    // Decimal separator, either "," or ".": "79,5" / "4.3".
    const cleaned = text.replace(/[.,](?=.*[.,])/g, "").replace(",", ".");
    value = Number.parseFloat(cleaned);
  }
  if (!Number.isFinite(value)) return null;
  // "$79M", "79 millones" — or a bare "79" in a COP column, which can only mean millions.
  if (millions || value < 100_000) value *= 1_000_000;
  return Math.round(value);
}

/**
 * Parses the price cell. Accepts the forms the team actually types:
 * "$79M – $85M", "$2.1M", "$79.000.000 - $85.000.000", "79 a 85 millones",
 * "Desde $79M", "COP 79,5M". "N/D", "-" or empty → no price.
 */
export function parsePriceRange(raw: string): { min: number | null; max: number | null } {
  const text = (raw ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  if (!text || /^n\/?\.?d\.?$/.test(text) || /^[-–—]+$/.test(text) || /consultar|no disponible|sin precio/.test(text)) {
    return { min: null, max: null };
  }

  const pattern = /(\$?)\s*(\d[\d.,]*)\s*(mm|millones|millon|mill|mlls?|m)?(?![a-z])/g;
  const found: { value: number; strong: boolean }[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const [, dollar, digits, suffix] = match;
    const number = digits.replace(/[.,]$/, "");
    if (!number) continue;
    const millions = Boolean(suffix && MILLIONS_SUFFIX.test(suffix));
    const value = readNumber(number, millions);
    if (value !== null) found.push({ value, strong: Boolean(dollar) || millions || /[.,]\d{3}/.test(number) });
  }
  // Prefer numbers that clearly are money ("$…", "…M", "79.000.000") over stray ones like a year.
  const strong = found.filter((item) => item.strong);
  // A bare number next to a clear one ("79 a 85 millones", "79 - 85M") shares its
  // unit, so keep it when it's in the same ballpark; a year like "(2026)" is not.
  const ballpark = (value: number) => strong.some((item) => value >= item.value / 5 && value <= item.value * 5);
  const values = (strong.length ? found.filter((item) => item.strong || ballpark(item.value)) : found).map(
    (item) => item.value
  );
  if (values.length === 0) return { min: null, max: null };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Keyword fallback for category names that aren't in CATEGORY_MAP verbatim
 * ("E-bike", "Ciclomotores / Mopeds", "VMP / Scooters Eléctricos Livianos"…).
 * Checked in order, so "bici" wins over "moto" and "moto" over "scooter".
 */
const CATEGORY_KEYWORDS: [RegExp, VehicleType][] = [
  [/bici|bike|bicycle|pedelec|cicla\b/, "e-bike"],
  [/autobus|\bbus|buseta|microbus/, "bus"],
  [/camion(?!eta)|tractomula|tractocamion|volqueta|furgon|carga pesada/, "truck"],
  [/cuadriciclo|cuatrimoto|\bquad|\batv\b/, "quad"],
  [/moto|ciclomotor|moped|tricimoto/, "motorcycle"],
  [/scooter|patinet|vmp|kick/, "scooter"],
  [/carro|auto|taxi|suv|sedan|camioneta|pickup|hatchback|crossover|\bvan\b|vehiculoliviano/, "car"],
];

export function mapCategory(raw: string): VehicleType | null {
  const key = normalize(raw);
  if (!key) return null;
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];

  const loose = raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-_]/g, "");
  for (const [pattern, type] of CATEGORY_KEYWORDS) {
    if (pattern.test(loose)) return type;
  }
  return null;
}

/** Finds the header row (the one carrying both Marca and Modelo) and maps columns. */
/** Header names that aren't verbatim in COLUMN_MAP ("Precio sugerido COP", "Rango de precio"…). */
function fuzzyColumn(header: string): keyof ColumnIndex | null {
  if (!header) return null;
  if (header.startsWith("marca")) return "brand";
  if (header.startsWith("modelo")) return "model";
  if (header.includes("precio") || header.includes("valor") || header === "cop") return "price";
  if (header.includes("categ") || header.startsWith("tipo")) return "category";
  if (header.includes("bater")) return "battery";
  if (header.includes("velocidad")) return "maxSpeed";
  if (header.includes("autonom")) return "range";
  if (header.includes("motor") || header.includes("potencia")) return "motor";
  if (header.includes("caracter") || header.includes("descrip")) return "features";
  if (header.includes("fuente")) return "source";
  return null;
}

function findHeader(rows: string[][]): { index: number; columns: ColumnIndex; labels: string[] } | null {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const normalized = row.map((value) => normalize(String(value ?? "")));
    if (!normalized.includes("marca") || !normalized.includes("modelo")) continue;

    const columns: ColumnIndex = { ...EMPTY_COLUMNS };
    normalized.forEach((header, columnIndex) => {
      const field = COLUMN_MAP[header] ?? fuzzyColumn(header);
      // First match wins, so a stray repeated header later can't clobber it.
      if (field && columns[field] === -1) {
        columns[field] = columnIndex;
      }
    });
    return { index: i, columns, labels: row.map((value) => String(value ?? "").trim()) };
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

    const priceRaw = cell(row, columns.price);
    const { min, max } = parsePriceRange(priceRaw);

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
      priceRaw,
      source: cell(row, columns.source),
    });
  }

  return {
    vehicles,
    skipped,
    headerRowNumber: header.index + 1,
    priceHeader: columns.price >= 0 ? header.labels[columns.price] || null : null,
    headerLabels: header.labels.filter(Boolean),
  };
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
