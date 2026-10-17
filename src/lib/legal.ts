/**
 * Data-protection details (Ley 1581 de 2012, Decreto 1377 de 2013).
 * When the S.A.S. has its NIT, fill in `nit` and `legalName` — the policy page
 * and the registration notice pick them up automatically.
 */
export const DATA_CONTROLLER = {
  brand: "E-VIREXION",
  legalName: "E-Virexion" as string,
  nit: null as string | null,
  city: "Bogotá, Colombia",
  email: "datos@evirexion.com",
  website: "evirexion.com",
};

/** Bump when the policy text changes materially; stored with each consent. */
export const PRIVACY_POLICY_VERSION = "2026-10-17";
export const PRIVACY_POLICY_PATH = "/privacidad";
