import { CURRENCY_META, type Currency } from "./countries";

const numberFormats = new Map<Currency, Intl.NumberFormat>();
const compactFormats = new Map<Currency, Intl.NumberFormat>();

function numberFormat(currency: Currency) {
  let format = numberFormats.get(currency);
  if (!format) {
    format = new Intl.NumberFormat(CURRENCY_META[currency].locale, { maximumFractionDigits: 0 });
    numberFormats.set(currency, format);
  }
  return format;
}

/**
 * "$79.000.000", "R$ 118.990", "S/ 1,400", "US$ 19,990".
 * The symbol is written explicitly so dollars, soles and reales never look alike.
 */
export function formatMoney(value: number, currency: Currency = "COP") {
  const { symbol } = CURRENCY_META[currency];
  const amount = numberFormat(currency).format(value);
  return symbol === "$" ? `$${amount}` : `${symbol} ${amount}`;
}

/** Short form for chart axes: "$79 M", "R$ 119 mil". */
export function formatMoneyCompact(value: number, currency: Currency = "COP") {
  let format = compactFormats.get(currency);
  if (!format) {
    format = new Intl.NumberFormat(CURRENCY_META[currency].locale, { notation: "compact", maximumFractionDigits: 1 });
    compactFormats.set(currency, format);
  }
  const { symbol } = CURRENCY_META[currency];
  return symbol === "$" ? `$${format.format(value)}` : `${symbol} ${format.format(value)}`;
}

/** Kept for older callers; same as formatMoney(value, "COP"). */
export function formatCOP(value: number) {
  return formatMoney(value, "COP");
}

/** "$79.000.000 – $85.000.000", a single value, the Sheet's note ("Descontinuado"), or the fallback. */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
  note?: string | null,
  fallback = "N/D",
  currency: Currency = "COP"
): string {
  if (min === null || min === undefined) return note || fallback;
  if (max === null || max === undefined || max === min) return formatMoney(min, currency);
  return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
}
