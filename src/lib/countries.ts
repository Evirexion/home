/**
 * Countries covered by the Guía de precios. Each country is one tab in the
 * Google Sheet; the Sheet's "Publicar precios" menu sends every country tab
 * and the site stores each one separately.
 *
 * To add a country: add it here, add its tab to the Sheet (with the country
 * name in the tab name), and publish. Nothing else needs to change.
 */

export type Currency = "COP" | "MXN" | "BRL" | "PEN" | "USD" | "ARS" | "CLP";

export type CountryCode = "CO" | "MX" | "BR" | "PE" | "AR" | "CL";

export interface Country {
  code: CountryCode;
  name: string;
  /** Currency a bare "$" means in this country's tab. */
  currency: Currency;
  /** URL value for ?pais= */
  slug: string;
}

export const COUNTRIES: Country[] = [
  { code: "CO", name: "Colombia", currency: "COP", slug: "colombia" },
  { code: "MX", name: "México", currency: "MXN", slug: "mexico" },
  { code: "BR", name: "Brasil", currency: "BRL", slug: "brasil" },
  { code: "PE", name: "Perú", currency: "PEN", slug: "peru" },
  { code: "AR", name: "Argentina", currency: "ARS", slug: "argentina" },
  { code: "CL", name: "Chile", currency: "CLP", slug: "chile" },
];

export const DEFAULT_COUNTRY: CountryCode = "CO";

export function getCountry(code: string | null | undefined): Country | null {
  if (!code) return null;
  const value = code
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
  return COUNTRIES.find((c) => c.code.toLowerCase() === value || c.slug === value) ?? null;
}

/** How each currency is written and formatted. */
export const CURRENCY_META: Record<Currency, { locale: string; symbol: string }> = {
  COP: { locale: "es-CO", symbol: "$" },
  MXN: { locale: "es-MX", symbol: "$" },
  BRL: { locale: "pt-BR", symbol: "R$" },
  PEN: { locale: "es-PE", symbol: "S/" },
  USD: { locale: "en-US", symbol: "US$" },
  ARS: { locale: "es-AR", symbol: "$" },
  CLP: { locale: "es-CL", symbol: "$" },
};
