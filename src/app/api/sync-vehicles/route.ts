import { syncVehiclesFromSheet } from "@/lib/vehicleSync";

/**
 * Triggers the Google Sheet -> Sanity vehicle sync.
 *
 * This runs server-side on purpose: the Google service account key and the
 * Sanity write token live here and never reach the Studio bundle. The Studio's
 * "Sincronizar vehículos desde Sheet" tool calls this endpoint with a shared
 * secret that the operator enters once in the Studio (kept in their browser's
 * localStorage, never compiled into the published Studio JavaScript).
 */

/**
 * Defaults to allowing any origin, which is safe here because the endpoint is
 * gated on a bearer secret rather than cookies. Set VEHICLE_SYNC_ALLOWED_ORIGINS
 * to a comma-separated list (e.g. your Studio URL) to lock it down further.
 */
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (process.env.VEHICLE_SYNC_ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  let allowOrigin = "";
  if (allowed.includes("*")) {
    allowOrigin = "*";
  } else if (origin && allowed.includes(origin)) {
    allowOrigin = origin;
  }

  return {
    // An empty value means "not allowed" — the browser blocks the response.
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Length-independent comparison, so a wrong secret can't be probed by timing. */
function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const headers = { ...corsHeaders(request.headers.get("origin")), "Content-Type": "application/json" };

  const expected = process.env.VEHICLE_SYNC_SECRET;
  if (!expected) {
    return Response.json(
      { ok: false, error: "VEHICLE_SYNC_SECRET no está configurada en el servidor." },
      { status: 503, headers }
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!provided || !secretMatches(provided, expected)) {
    return Response.json({ ok: false, error: "No autorizado." }, { status: 401, headers });
  }

  let dryRun = false;
  try {
    const body = (await request.json()) as { dryRun?: boolean } | null;
    dryRun = Boolean(body?.dryRun);
  } catch {
    // No body is fine — defaults to a real sync.
  }

  try {
    const summary = await syncVehiclesFromSheet({ dryRun });
    return Response.json({ ok: true, summary }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido durante la sincronización.";
    console.error("Vehicle sync failed", error);
    return Response.json({ ok: false, error: message }, { status: 500, headers });
  }
}
