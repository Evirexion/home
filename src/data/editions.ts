/**
 * Magazine editions available in the reader. Page images live in Cloudflare KV
 * under "revista:<slug>:<NN>" (uploaded with `wrangler kv bulk put`, see
 * docs/revista.md). Pages up to `previewPages` are free; the rest need a
 * verified reader account.
 */
export interface Edition {
  slug: string;
  number: string;
  title: string;
  month: string;
  pages: number;
  previewPages: number;
  /** Page image size in px, for the reader's aspect ratio. */
  width: number;
  height: number;
  highlights: string[];
}

export const EDITIONS: Edition[] = [
  {
    slug: "2026-10",
    number: "001",
    title: "La revolución eléctrica en Colombia",
    month: "Octubre 2026",
    pages: 52,
    previewPages: 9,
    width: 1100,
    height: 1556,
    highlights: [
      "Nosotros también fuimos escépticos",
      "Línea de tiempo 1884 – 2013",
      "i-MiEV: el primer eléctrico comercial",
      "La placa VELMPU y la micromovilidad",
      "Matrículas eléctricas +222,5 %",
      "Guía de precios: 307 vehículos",
    ],
  },
];

export function getEdition(slug: string): Edition | null {
  return EDITIONS.find((edition) => edition.slug === slug) ?? null;
}

export function pageKey(slug: string, page: number): string {
  return `revista:${slug}:${String(page).padStart(2, "0")}`;
}
