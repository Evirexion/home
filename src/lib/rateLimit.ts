import { headers } from "next/headers";
import { getDB } from "@/lib/cloudflare";
import { sha256 } from "@/lib/accounts/crypto";

/**
 * Fixed-window rate limiting per visitor IP, stored in D1.
 *
 * Stops password guessing across many accounts, signup/reset spam and
 * contact-form floods. IPs are stored only as a salted SHA-256, never in
 * clear. If D1 is unreachable the check lets the request through (the
 * per-account lockout in accounts/index.ts still protects logins).
 */

export type Bucket = "login" | "register" | "reset" | "contact" | "internal-login" | "google";

const LIMITS: Record<Bucket, { max: number; windowMs: number }> = {
  login: { max: 10, windowMs: 15 * 60 * 1000 },
  register: { max: 5, windowMs: 60 * 60 * 1000 },
  reset: { max: 5, windowMs: 60 * 60 * 1000 },
  contact: { max: 5, windowMs: 60 * 60 * 1000 },
  "internal-login": { max: 5, windowMs: 15 * 60 * 1000 },
  google: { max: 20, windowMs: 15 * 60 * 1000 },
};

let tableReady = false;

export async function clientIp(): Promise<string> {
  const h = await headers();
  // Set by Cloudflare's edge; clients can't override it on a Workers route.
  return h.get("cf-connecting-ip") ?? "unknown";
}

/** Returns true when the request is allowed; false once the IP exceeded the bucket's limit. */
export async function rateLimit(bucket: Bucket, ip?: string): Promise<boolean> {
  const { max, windowMs } = LIMITS[bucket];
  try {
    const db = await getDB();
    if (!db) return true;
    if (!tableReady) {
      await db
        .prepare(
          "CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL)"
        )
        .run();
      tableReady = true;
    }
    const salt = process.env.RATE_LIMIT_SALT ?? "evx-rl";
    const key = `${bucket}:${await sha256(`${salt}:${ip ?? (await clientIp())}`)}`;
    const now = Date.now();
    const cutoff = now - windowMs;
    const row = await db
      .prepare(
        `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
         ON CONFLICT(key) DO UPDATE SET
           count = CASE WHEN window_start < ? THEN 1 ELSE count + 1 END,
           window_start = CASE WHEN window_start < ? THEN ? ELSE window_start END
         RETURNING count`
      )
      .bind(key, now, cutoff, cutoff, now)
      .first<{ count: number }>();
    // Occasionally drop stale rows so the table stays small.
    if (Math.random() < 0.02) {
      await db.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(now - 24 * 60 * 60 * 1000).run();
    }
    return (row?.count ?? 0) <= max;
  } catch (error) {
    console.error("Rate limit check failed", error);
    return true;
  }
}

export const RATE_LIMITED_MESSAGE = "Demasiados intentos desde tu conexión. Espera unos minutos e intenta de nuevo.";
