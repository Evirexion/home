/**
 * "Continuar con Google" — OAuth 2.0 / OpenID Connect authorization-code flow
 * with PKCE, implemented with fetch + Web Crypto (no SDK; runs on Workers).
 *
 * The ID token comes straight from Google's token endpoint over TLS, which per
 * OpenID Connect Core §3.1.3.7 lets us skip signature verification; we still
 * check issuer, audience, expiry and that Google verified the email.
 */

import { randomToken, sha256 } from "./crypto";

export const GOOGLE_STATE_COOKIE = "evx_google_oauth";

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
}

function base64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function callbackUrl(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

/** Builds the Google consent URL and the cookie value that must come back with it. */
export async function startGoogleLogin(origin: string, next: string) {
  const state = randomToken();
  const verifier = randomToken();
  const challenge = base64Url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    cookie: JSON.stringify({ state: await sha256(state), verifier, next }),
  };
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string;
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const part = jwt.split(".")[1] ?? "";
  const json = atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(json, (c) => c.charCodeAt(0))));
}

/** Exchanges the code for the reader's verified Google identity, or throws with a reason. */
export async function finishGoogleLogin(input: {
  origin: string;
  code: string;
  state: string;
  cookie: string | undefined;
}): Promise<{ identity: GoogleIdentity; next: string }> {
  if (!input.cookie) throw new Error("La sesión de inicio con Google expiró. Intenta de nuevo.");
  const saved = JSON.parse(input.cookie) as { state: string; verifier: string; next: string };
  if (!input.state || (await sha256(input.state)) !== saved.state) {
    throw new Error("No pudimos validar el inicio con Google. Intenta de nuevo.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      redirect_uri: callbackUrl(input.origin),
      grant_type: "authorization_code",
      code_verifier: saved.verifier,
    }),
  });
  if (!response.ok) {
    console.error("Google token error", response.status, await response.text().catch(() => ""));
    throw new Error("Google no aceptó el inicio de sesión. Intenta de nuevo.");
  }
  const { id_token: idToken } = (await response.json()) as { id_token?: string };
  if (!idToken) throw new Error("Google no devolvió tus datos. Intenta de nuevo.");

  const claims = decodeJwtPayload(idToken);
  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  const audienceOk = claims.aud === process.env.GOOGLE_OAUTH_CLIENT_ID;
  const fresh = typeof claims.exp === "number" && claims.exp * 1000 > Date.now();
  if (!issuerOk || !audienceOk || !fresh) throw new Error("No pudimos validar tu cuenta de Google.");
  if (claims.email_verified !== true || typeof claims.email !== "string") {
    throw new Error("Tu cuenta de Google no tiene un correo verificado.");
  }

  const email = claims.email;
  const name = typeof claims.name === "string" && claims.name.trim() ? claims.name.trim() : email.split("@")[0];
  return { identity: { sub: String(claims.sub), email, name }, next: saved.next };
}
