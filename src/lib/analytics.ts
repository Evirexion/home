/**
 * Google Analytics 4.
 *
 * Paste the property's Measurement ID ("G-XXXXXXXXXX", from Analytics → Admin →
 * Data streams → the evirexion.com stream). While it is empty, nothing loads and
 * the cookie notice stays hidden. It can also be set at build time with
 * NEXT_PUBLIC_GA_ID in .env.local.
 *
 * Analytics only loads after the visitor accepts measurement cookies in the
 * notice (Ley 1581 / Política de Tratamiento de Datos, sección 7).
 */
export const GA_MEASUREMENT_ID: string = process.env.NEXT_PUBLIC_GA_ID || "G-9JTNDJ89SL";

export type CookieConsent = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "evx-cookies";
/** Fired on window to reopen the cookie notice (footer link). */
export const OPEN_CONSENT_EVENT = "evx:open-cookie-settings";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function readConsent(): CookieConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: CookieConsent) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Private mode or blocked storage: the choice lasts for this page view only.
  }
}

/**
 * Sends a GA4 event. A no-op when Analytics isn't configured or the visitor
 * hasn't accepted, so it is always safe to call.
 */
export function track(event: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}
