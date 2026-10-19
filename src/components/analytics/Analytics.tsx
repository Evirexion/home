"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  GA_MEASUREMENT_ID,
  OPEN_CONSENT_EVENT,
  readConsent,
  saveConsent,
  type CookieConsent,
} from "@/lib/analytics";
import { PRIVACY_POLICY_PATH } from "@/lib/legal";

/** Removes GA cookies (_ga, _ga_<id>) for this domain and its parent. */
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

const CONSENT_CHANGED_EVENT = "evx:cookie-consent-changed";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  };
}

/**
 * Loads Google Analytics only after the visitor accepts, and shows the cookie
 * notice until they choose. Renders nothing while GA_MEASUREMENT_ID is empty.
 */
export function Analytics() {
  // "server" during SSR/hydration, then the stored choice or "unset".
  const consent = useSyncExternalStore<CookieConsent | "unset" | "server">(
    subscribe,
    () => readConsent() ?? "unset",
    () => "server",
  );
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!GA_MEASUREMENT_ID || consent === "server") return null;
  const open = consent === "unset" || reopened;

  function choose(value: CookieConsent) {
    const wasGranted = consent === "granted";
    saveConsent(value);
    setReopened(false);
    if (value === "denied" && wasGranted) {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      clearAnalyticsCookies();
    }
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  }

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
          </Script>
        </>
      )}

      {open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Preferencias de cookies"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl md:inset-x-6"
        >
          <div className="metal-edge flex flex-col gap-4 rounded-2xl border border-silver-300/15 bg-ink-raised/95 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur md:flex-row md:items-center md:gap-6">
            <p className="text-xs leading-relaxed text-silver-300 md:text-sm">
              Usamos cookies de medición (Google Analytics) para entender qué contenidos se leen y mejorar la revista.
              Solo se activan si aceptas.{" "}
              <Link href={PRIVACY_POLICY_PATH} className="text-electric underline underline-offset-2">
                Más información
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="rounded-full border border-silver-300/30 px-5 py-2 text-sm font-semibold text-silver-100 transition-colors duration-300 hover:border-electric/50 hover:text-electric"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="brand-gradient-bg metal-edge rounded-full px-5 py-2 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-[1.03]"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
