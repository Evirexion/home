"use client";

import { GA_MEASUREMENT_ID, OPEN_CONSENT_EVENT } from "@/lib/analytics";

/** Footer link that reopens the cookie notice. Hidden while Analytics isn't configured. */
export function CookieSettingsLink({ className }: { className?: string }) {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      {" · "}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
        className={className}
      >
        Preferencias de cookies
      </button>
    </>
  );
}
