const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number) {
  return cop.format(value);
}

/** "$79.000.000 – $85.000.000", a single value, the Sheet's note ("Descontinuado"), or the fallback. */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
  note?: string | null,
  fallback = "N/D"
): string {
  if (min === null || min === undefined) return note || fallback;
  if (max === null || max === undefined || max === min) return formatCOP(min);
  return `${formatCOP(min)} – ${formatCOP(max)}`;
}
