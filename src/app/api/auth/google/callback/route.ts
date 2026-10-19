import { cookies } from "next/headers";
import { countVerifiedSubscribers, createPendingGoogleSignup, findOrLinkGoogleUser, startSession } from "@/lib/accounts";
import { finishGoogleLogin, GOOGLE_STATE_COOKIE } from "@/lib/accounts/google";
import { sendNewSubscriberNotice } from "@/lib/accounts/mailer";

function back(origin: string, path: string) {
  return new Response(null, { status: 302, headers: { Location: new URL(path, origin).toString() } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const store = await cookies();
  const cookie = store.get(GOOGLE_STATE_COOKIE)?.value;
  store.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });

  // The reader pressed "Cancel" on Google's screen.
  if (url.searchParams.get("error")) return back(url.origin, "/cuenta/ingresar");

  try {
    const { identity, next } = await finishGoogleLogin({
      origin: url.origin,
      code: url.searchParams.get("code") ?? "",
      state: url.searchParams.get("state") ?? "",
      cookie,
    });

    const existing = await findOrLinkGoogleUser(identity);
    if (existing) {
      await startSession(existing.user.id);
      if (existing.firstTime) {
        try {
          await sendNewSubscriberNotice(existing.user, await countVerifiedSubscribers(), url.origin);
        } catch (error) {
          console.error("New-subscriber notice failed", error);
        }
      }
      return back(url.origin, next);
    }

    // New reader: they must authorise data processing before we create the account.
    const token = await createPendingGoogleSignup(identity, next);
    return back(url.origin, `/cuenta/google?t=${token}`);
  } catch (error) {
    console.error("Google sign-in failed", error);
    // A fixed code, not the message: the login page shouldn't echo arbitrary text from the URL.
    return back(url.origin, "/cuenta/ingresar?error=google");
  }
}
