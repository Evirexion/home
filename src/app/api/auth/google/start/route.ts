import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { GOOGLE_STATE_COOKIE, isGoogleConfigured, startGoogleLogin } from "@/lib/accounts/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!isGoogleConfigured()) return Response.redirect(new URL("/cuenta/ingresar", url), 302);
  if (!(await rateLimit("google", request.headers.get("cf-connecting-ip") ?? "unknown"))) {
    return new Response("Demasiados intentos. Espera unos minutos.", { status: 429 });
  }
  const nextParam = url.searchParams.get("next") ?? "";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/revista";

  const { url: googleUrl, cookie } = await startGoogleLogin(url.origin, next);
  (await cookies()).set(GOOGLE_STATE_COOKIE, cookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax", // Google redirects back with a top-level GET, which Lax allows.
    path: "/api/auth/google",
    maxAge: 600,
  });
  return Response.redirect(googleUrl, 302);
}
