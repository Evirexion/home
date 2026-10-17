/** Access to Cloudflare bindings declared in wrangler.jsonc. */

export interface KVLike {
  get(key: string, type: "json"): Promise<unknown>;
  get(key: string, type: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface D1Result<T> {
  results: T[];
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
export interface D1Like {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

async function getEnv(): Promise<Record<string, unknown> | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getKV(): Promise<KVLike | null> {
  return ((await getEnv())?.PRICES_KV as KVLike | undefined) ?? null;
}

export async function getDB(): Promise<D1Like | null> {
  return ((await getEnv())?.DB as D1Like | undefined) ?? null;
}
