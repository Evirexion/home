export const INTERNAL_SESSION_COOKIE = "evx_internal_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12h

function bufferToHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bufferToHex(signature);
}

/** Signed `expiry.signature` token; requires no session store, just the shared secret. */
export async function createSessionValue(): Promise<string> {
  const secret = process.env.INTERNAL_NEWS_SESSION_SECRET;
  if (!secret) throw new Error("INTERNAL_NEWS_SESSION_SECRET is not configured");
  const expires = Date.now() + SESSION_DURATION_MS;
  const signature = await hmac(secret, String(expires));
  return `${expires}.${signature}`;
}

export async function isValidSession(value: string | undefined): Promise<boolean> {
  const secret = process.env.INTERNAL_NEWS_SESSION_SECRET;
  if (!value || !secret) return false;
  const [expiresStr, signature] = value.split(".");
  const expires = Number(expiresStr);
  if (!expires || Number.isNaN(expires) || Date.now() > expires) return false;
  const expected = await hmac(secret, expiresStr);
  return expected === signature;
}
