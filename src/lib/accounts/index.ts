import { cookies } from "next/headers";
import { getDB, type D1Like } from "@/lib/cloudflare";
import { PRIVACY_POLICY_VERSION } from "@/lib/legal";
import { hashPassword, randomId, randomToken, sha256, verifyPassword } from "./crypto";

/**
 * Reader accounts for the magazine portal, stored in Cloudflare D1.
 *
 * - Passwords: PBKDF2-SHA256, never stored in clear.
 * - Sessions and email tokens: random values sent to the browser / inbox; only
 *   their SHA-256 is stored, so a database leak can't be replayed as a login.
 * - Consent (Ley 1581): when, which policy version, and from which IP each
 *   reader authorised the processing of their data.
 */

export const SESSION_COOKIE = "evx_session";
const SESSION_DAYS = 30;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  marketingConsent: boolean;
  createdAt: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified_at: string | null;
  marketing_consent: number;
  failed_logins: number;
  locked_until: number | null;
  created_at: string;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified_at TEXT,
    consent_at TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    consent_ip TEXT,
    marketing_consent INTEGER NOT NULL DEFAULT 0,
    failed_logins INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS email_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    purpose TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS email_tokens_user ON email_tokens(user_id, purpose)`,
];

let schemaReady = false;

async function db(): Promise<D1Like> {
  const database = await getDB();
  if (!database) throw new AccountError("Las cuentas no están disponibles en este momento.");
  if (!schemaReady) {
    await database.batch(SCHEMA.map((sql) => database.prepare(sql)));
    schemaReady = true;
  }
  return database;
}

export class AccountError extends Error {}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    emailVerified: Boolean(row.email_verified_at),
    marketingConsent: row.marketing_consent === 1,
    createdAt: row.created_at,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findByEmail(email: string): Promise<UserRow | null> {
  return (await db()).prepare("SELECT * FROM users WHERE email = ?").bind(normalizeEmail(email)).first<UserRow>();
}

async function findById(id: string): Promise<UserRow | null> {
  return (await db()).prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
}

// ── Registration & verification ────────────────────────────────────────────

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  marketingConsent: boolean;
  ip: string | null;
}): Promise<{ user: User; created: boolean }> {
  const database = await db();
  const existing = await findByEmail(input.email);
  if (existing) {
    // Don't reveal whether an address is registered; the caller treats this
    // like a fresh signup (and re-sends verification if still unverified).
    return { user: toUser(existing), created: false };
  }
  const now = new Date().toISOString();
  const row = {
    id: randomId(),
    email: normalizeEmail(input.email),
    name: input.name.trim().slice(0, 120),
    password_hash: await hashPassword(input.password),
  };
  await database
    .prepare(
      `INSERT INTO users (id, email, name, password_hash, consent_at, consent_version, consent_ip, marketing_consent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      row.id,
      row.email,
      row.name,
      row.password_hash,
      now,
      PRIVACY_POLICY_VERSION,
      input.ip,
      input.marketingConsent ? 1 : 0,
      now
    )
    .run();
  return {
    user: { id: row.id, email: row.email, name: row.name, emailVerified: false, marketingConsent: input.marketingConsent, createdAt: now },
    created: true,
  };
}

async function issueEmailToken(userId: string, purpose: "verify" | "reset", ttlMs: number): Promise<string | null> {
  const database = await db();
  // At most one email per minute per purpose, so the form can't be used to spam an inbox.
  const recent = await database
    .prepare("SELECT created_at FROM email_tokens WHERE user_id = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1")
    .bind(userId, purpose)
    .first<{ created_at: number }>();
  if (recent && Date.now() - recent.created_at < 60_000) return null;

  const token = randomToken();
  await database.batch([
    database.prepare("DELETE FROM email_tokens WHERE user_id = ? AND purpose = ?").bind(userId, purpose),
    database
      .prepare("INSERT INTO email_tokens (token_hash, user_id, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(await sha256(token), userId, purpose, Date.now() + ttlMs, Date.now()),
  ]);
  return token;
}

export function issueVerificationToken(userId: string) {
  return issueEmailToken(userId, "verify", VERIFY_TTL_MS);
}

async function consumeEmailToken(token: string, purpose: "verify" | "reset"): Promise<string | null> {
  const database = await db();
  const hash = await sha256(token);
  const row = await database
    .prepare("SELECT user_id, expires_at FROM email_tokens WHERE token_hash = ? AND purpose = ?")
    .bind(hash, purpose)
    .first<{ user_id: string; expires_at: number }>();
  if (!row) return null;
  await database.prepare("DELETE FROM email_tokens WHERE token_hash = ?").bind(hash).run();
  return row.expires_at > Date.now() ? row.user_id : null;
}

export async function verifyEmail(token: string): Promise<User | null> {
  const userId = await consumeEmailToken(token, "verify");
  if (!userId) return null;
  await (await db())
    .prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?")
    .bind(new Date().toISOString(), userId)
    .run();
  const row = await findById(userId);
  return row ? toUser(row) : null;
}

// ── Login & sessions ───────────────────────────────────────────────────────

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; reason: "invalid" | "locked" | "unverified"; user?: User };

export async function authenticate(email: string, password: string): Promise<LoginResult> {
  const database = await db();
  const row = await findByEmail(email);
  if (!row) {
    // Spend comparable time so response timing doesn't reveal unknown emails.
    await verifyPassword(password, "pbkdf2$100000$00000000000000000000000000000000$00");
    return { ok: false, reason: "invalid" };
  }
  if (row.locked_until && row.locked_until > Date.now()) return { ok: false, reason: "locked" };

  if (!(await verifyPassword(password, row.password_hash))) {
    const failed = row.failed_logins + 1;
    await database
      .prepare("UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?")
      .bind(failed >= MAX_FAILED_LOGINS ? 0 : failed, failed >= MAX_FAILED_LOGINS ? Date.now() + LOCK_MS : null, row.id)
      .run();
    return { ok: false, reason: failed >= MAX_FAILED_LOGINS ? "locked" : "invalid" };
  }

  if (row.failed_logins || row.locked_until) {
    await database.prepare("UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = ?").bind(row.id).run();
  }
  if (!row.email_verified_at) return { ok: false, reason: "unverified", user: toUser(row) };
  return { ok: true, user: toUser(row) };
}

export async function startSession(userId: string): Promise<void> {
  const token = randomToken();
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  await (await db())
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, expires, new Date().toISOString())
    .run();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await (await db()).prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    } catch {
      // The cookie is removed below either way.
    }
  }
  store.delete(SESSION_COOKIE);
}

/** The signed-in, verified reader for this request, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const row = await (await db())
      .prepare(
        `SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id
         WHERE sessions.token_hash = ? AND sessions.expires_at > ?`
      )
      .bind(await sha256(token), Date.now())
      .first<UserRow>();
    return row && row.email_verified_at ? toUser(row) : null;
  } catch (error) {
    console.error("Session lookup failed", error);
    return null;
  }
}

// ── Password reset ─────────────────────────────────────────────────────────

export async function issuePasswordResetToken(email: string): Promise<{ token: string; user: User } | null> {
  const row = await findByEmail(email);
  if (!row) return null;
  const token = await issueEmailToken(row.id, "reset", RESET_TTL_MS);
  return token ? { token, user: toUser(row) } : null;
}

export async function resetPassword(token: string, newPassword: string): Promise<User | null> {
  const userId = await consumeEmailToken(token, "reset");
  if (!userId) return null;
  const database = await db();
  await database.batch([
    // Following the reset link proves control of the inbox, so it also verifies it.
    database
      .prepare(
        "UPDATE users SET password_hash = ?, failed_logins = 0, locked_until = NULL, email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?"
      )
      .bind(await hashPassword(newPassword), new Date().toISOString(), userId),
    // Sign out every other device.
    database.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
  ]);
  const row = await findById(userId);
  return row ? toUser(row) : null;
}

// ── Reader rights (Ley 1581): update, revoke, delete ───────────────────────

export async function updateProfile(userId: string, changes: { name?: string; marketingConsent?: boolean }) {
  const database = await db();
  if (changes.name !== undefined) {
    await database.prepare("UPDATE users SET name = ? WHERE id = ?").bind(changes.name.trim().slice(0, 120), userId).run();
  }
  if (changes.marketingConsent !== undefined) {
    await database
      .prepare("UPDATE users SET marketing_consent = ? WHERE id = ?")
      .bind(changes.marketingConsent ? 1 : 0, userId)
      .run();
  }
}

export async function deleteAccount(userId: string): Promise<void> {
  const database = await db();
  await database.batch([
    database.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
    database.prepare("DELETE FROM email_tokens WHERE user_id = ?").bind(userId),
    database.prepare("DELETE FROM users WHERE id = ?").bind(userId),
  ]);
  (await cookies()).delete(SESSION_COOKIE);
}

export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (password.length > 200) return "La contraseña es demasiado larga.";
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(password) || !/\d/.test(password)) {
    return "Usa al menos una letra y un número.";
  }
  return null;
}
