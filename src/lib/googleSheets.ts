/**
 * Google Sheets API v4 access via a service account.
 *
 * Implemented with Web Crypto rather than `googleapis` / `google-auth-library`
 * because those assume Node's crypto module and don't run on the Cloudflare
 * Workers runtime this site is deployed to.
 *
 * The service account key lives in the server-only GOOGLE_SERVICE_ACCOUNT_KEY
 * env var and never reaches the browser — the Studio triggers the sync through
 * /api/sync-vehicles, which is the only place this module is used.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export interface ServiceAccountKey {
  clientEmail: string;
  privateKey: string;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function textToBase64Url(text: string): string {
  return bytesToBase64Url(new TextEncoder().encode(text));
}

/**
 * Reads the service account key from the environment. Accepts either the raw
 * JSON of the downloaded key file or that same JSON base64-encoded, since
 * base64 avoids newline/quoting problems when storing it as a secret.
 */
export function loadServiceAccountKey(): ServiceAccountKey | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;

  let json: string;
  try {
    json = raw.startsWith("{") ? raw : new TextDecoder().decode(base64ToBytes(raw));
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY no se pudo leer: debe ser el JSON de la clave o ese JSON en base64."
    );
  }

  let parsed: { client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY no contiene JSON válido.");
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY no tiene los campos client_email y private_key."
    );
  }

  return {
    clientEmail: parsed.client_email,
    // Tolerates keys stored with escaped newlines rather than real ones.
    privateKey: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

/** Returns a plain ArrayBuffer, which is what SubtleCrypto's BufferSource wants. */
function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bytes = base64ToBytes(body);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/** Signs the short-lived assertion Google exchanges for an access token. */
async function createAssertion(key: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: key.clientEmail,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${textToBase64Url(JSON.stringify(header))}.${textToBase64Url(
    JSON.stringify(claims)
  )}`;

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      pemToPkcs8(key.privateKey),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  } catch {
    throw new Error(
      "La private_key de la cuenta de servicio no es válida (se espera una clave PKCS#8 en formato PEM)."
    );
  }

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: await createAssertion(key),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Google token exchange failed", response.status, detail);
    throw new Error(
      `Google rechazó las credenciales de la cuenta de servicio (${response.status}). Revisa que la Sheets API esté habilitada y que la clave siga activa.`
    );
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google no devolvió un access token.");
  }
  return data.access_token;
}

/** Escapes a sheet title for A1 notation (single quotes are doubled). */
function toA1Range(title: string): string {
  return `'${title.replace(/'/g, "''")}'!A:Z`;
}

export interface SheetData {
  /** Title of the tab the rows came from. */
  sheetTitle: string;
  /** Raw row values, ragged — trailing empty cells are omitted by the API. */
  rows: string[][];
}

/**
 * Reads a tab's values. The Sheets API addresses tabs by title, not by the gid
 * in the URL, so the gid is resolved against the spreadsheet metadata first.
 */
export async function fetchSheetData({
  spreadsheetId,
  gid,
}: {
  spreadsheetId: string;
  gid?: string | number;
}): Promise<SheetData> {
  const key = loadServiceAccountKey();
  if (!key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY no está configurada en el servidor, así que no se puede leer el Sheet."
    );
  }

  const token = await getAccessToken(key);
  const authHeaders = { Authorization: `Bearer ${token}` };

  const metaResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}?fields=sheets.properties(sheetId,title)`,
    { headers: authHeaders }
  );

  if (!metaResponse.ok) {
    const detail = await metaResponse.text().catch(() => "");
    console.error("Sheets metadata request failed", metaResponse.status, detail);
    if (metaResponse.status === 403 || metaResponse.status === 404) {
      throw new Error(
        `No se pudo abrir el Sheet (${metaResponse.status}). Comparte el documento con ${key.clientEmail} como Lector y verifica el ID.`
      );
    }
    throw new Error(`No se pudo leer la metadata del Sheet (${metaResponse.status}).`);
  }

  const meta = (await metaResponse.json()) as {
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  };
  const sheets = meta.sheets ?? [];

  const target =
    gid === undefined || gid === ""
      ? sheets[0]
      : sheets.find((sheet) => String(sheet.properties?.sheetId) === String(gid));

  const sheetTitle = target?.properties?.title;
  if (!sheetTitle) {
    const available = sheets
      .map((sheet) => `${sheet.properties?.title} (gid ${sheet.properties?.sheetId})`)
      .join(", ");
    throw new Error(`No se encontró la pestaña con gid ${gid}. Pestañas disponibles: ${available}`);
  }

  const valuesResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(toA1Range(sheetTitle))}?majorDimension=ROWS`,
    { headers: authHeaders }
  );

  if (!valuesResponse.ok) {
    const detail = await valuesResponse.text().catch(() => "");
    console.error("Sheets values request failed", valuesResponse.status, detail);
    throw new Error(`No se pudieron leer las filas del Sheet (${valuesResponse.status}).`);
  }

  const data = (await valuesResponse.json()) as { values?: string[][] };
  return { sheetTitle, rows: data.values ?? [] };
}
