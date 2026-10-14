import type { VehicleListing } from "@/types/content";

/**
 * Published price guide, stored in Cloudflare KV.
 *
 * The Google Sheet is the source of truth. When the operator clicks
 * "E-Virexion › Publicar precios en la web" inside the Sheet, an Apps Script
 * sends the sheet's rows to /api/prices/publish, which parses them and writes
 * the result here. /prices reads this on every request, so a publish shows up
 * on the site immediately — no rebuild, no redeploy.
 *
 * The previous snapshot is kept under a second key so a bad publish can be
 * rolled back from the Sheet menu.
 */

export interface PublishedPrices {
  publishedAt: string;
  publishedBy: string | null;
  vehicles: VehicleListing[];
}

const CURRENT_KEY = "prices:current";
const PREVIOUS_KEY = "prices:previous";

/** The slice of the Workers KV API this module uses. */
interface KVLike {
  get(key: string, type: "json"): Promise<unknown>;
  put(key: string, value: string): Promise<void>;
}

async function getKV(): Promise<KVLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as unknown as Record<string, unknown>).PRICES_KV as KVLike | undefined;
    return kv ?? null;
  } catch {
    // Not running on Cloudflare (e.g. plain `next build` prerender) — no store.
    return null;
  }
}

export async function isPriceStoreAvailable(): Promise<boolean> {
  return (await getKV()) !== null;
}

export async function readPublishedPrices(): Promise<PublishedPrices | null> {
  const kv = await getKV();
  if (!kv) return null;
  const data = (await kv.get(CURRENT_KEY, "json")) as PublishedPrices | null;
  return data && Array.isArray(data.vehicles) ? data : null;
}

export async function writePublishedPrices(next: PublishedPrices): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error("El almacenamiento de precios (PRICES_KV) no está disponible en el servidor.");
  const current = await kv.get(CURRENT_KEY, "json");
  if (current) await kv.put(PREVIOUS_KEY, JSON.stringify(current));
  await kv.put(CURRENT_KEY, JSON.stringify(next));
}

/** Swaps current and previous. Returns the snapshot that is now live, or null if there was nothing to restore. */
export async function rollbackPublishedPrices(): Promise<PublishedPrices | null> {
  const kv = await getKV();
  if (!kv) throw new Error("El almacenamiento de precios (PRICES_KV) no está disponible en el servidor.");
  const previous = (await kv.get(PREVIOUS_KEY, "json")) as PublishedPrices | null;
  if (!previous) return null;
  const current = await kv.get(CURRENT_KEY, "json");
  await kv.put(CURRENT_KEY, JSON.stringify(previous));
  if (current) await kv.put(PREVIOUS_KEY, JSON.stringify(current));
  return previous;
}
