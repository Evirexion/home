import type { VehicleListing } from "@/types/content";
import { COUNTRIES, type CountryCode } from "./countries";

/**
 * Published price guide, stored in Cloudflare KV — one entry per country.
 *
 * The Google Sheet is the source of truth. When the operator clicks
 * "E-Virexion › Publicar precios en la web" inside the Sheet, an Apps Script
 * sends each country tab to /api/prices/publish, which parses it and writes
 * the result here. /prices reads this on every request, so a publish shows up
 * on the site immediately — no rebuild, no redeploy.
 *
 * The previous snapshot of each country is kept under a second key so a bad
 * publish can be rolled back from the Sheet menu.
 */

export interface PublishedPrices {
  publishedAt: string;
  publishedBy: string | null;
  country?: CountryCode;
  vehicles: VehicleListing[];
}

/** Keys used before the guide had more than one country; they hold Colombia. */
const LEGACY_CURRENT_KEY = "prices:current";
const LEGACY_PREVIOUS_KEY = "prices:previous";

const currentKey = (country: CountryCode) => `prices:current:${country}`;
const previousKey = (country: CountryCode) => `prices:previous:${country}`;

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

function asSnapshot(data: unknown): PublishedPrices | null {
  const snapshot = data as PublishedPrices | null;
  return snapshot && Array.isArray(snapshot.vehicles) ? snapshot : null;
}

async function readKey(kv: KVLike, country: CountryCode, which: "current" | "previous") {
  const key = which === "current" ? currentKey(country) : previousKey(country);
  const value = asSnapshot(await kv.get(key, "json"));
  if (value || country !== "CO") return value;
  // Colombia published before multi-country support lives under the old key.
  return asSnapshot(await kv.get(which === "current" ? LEGACY_CURRENT_KEY : LEGACY_PREVIOUS_KEY, "json"));
}

export async function isPriceStoreAvailable(): Promise<boolean> {
  return (await getKV()) !== null;
}

export async function readPublishedPrices(country: CountryCode = "CO"): Promise<PublishedPrices | null> {
  const kv = await getKV();
  if (!kv) return null;
  return readKey(kv, country, "current");
}

/** Countries that have at least one published vehicle, in COUNTRIES order. */
export async function readPublishedCountries(): Promise<CountryCode[]> {
  const kv = await getKV();
  if (!kv) return [];
  const found = await Promise.all(
    COUNTRIES.map(async (c) => ((await readKey(kv, c.code, "current"))?.vehicles.length ? c.code : null))
  );
  return found.filter((code): code is CountryCode => code !== null);
}

export async function writePublishedPrices(country: CountryCode, next: PublishedPrices): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error("El almacenamiento de precios (PRICES_KV) no está disponible en el servidor.");
  const current = await readKey(kv, country, "current");
  if (current) await kv.put(previousKey(country), JSON.stringify(current));
  await kv.put(currentKey(country), JSON.stringify({ ...next, country }));
}

/** Swaps current and previous for one country. Returns the snapshot that is now live, or null if there was nothing to restore. */
export async function rollbackPublishedPrices(country: CountryCode = "CO"): Promise<PublishedPrices | null> {
  const kv = await getKV();
  if (!kv) throw new Error("El almacenamiento de precios (PRICES_KV) no está disponible en el servidor.");
  const previous = await readKey(kv, country, "previous");
  if (!previous) return null;
  const current = await readKey(kv, country, "current");
  await kv.put(currentKey(country), JSON.stringify(previous));
  if (current) await kv.put(previousKey(country), JSON.stringify(current));
  return previous;
}
