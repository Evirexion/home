import { cookies } from "next/headers";
import { GOOGLE_STATE_COOKIE, isGoogleConfigured, startGoogleLogin } from "@/lib/accounts/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!isGoogleConfigured()) return Response.redirect(new URL("/cuenta/ingresar", url), 302);
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
