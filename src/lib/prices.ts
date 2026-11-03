import { mockVehicleListings } from "@/data/vehicles";
import type { VehicleListing } from "@/types/content";
import type { CountryCode } from "./countries";
import { readPublishedCountries, readPublishedPrices } from "./priceStore";
import { isSanityConfigured, sanityClient } from "./sanity/client";
import { vehicleListingsQuery } from "./sanity/queries";

/**
 * Order of precedence:
 * 1. What was last published from the Google Sheet for that country (Cloudflare KV)
 * 2. Colombia only: Sanity, if a project is connected
 * 3. Colombia only: the bundled list in src/data/vehicles.ts
 */
export async function getVehicleListings(country: CountryCode = "CO"): Promise<VehicleListing[]> {
  try {
    const published = await readPublishedPrices(country);
    if (published && published.vehicles.length > 0) return published.vehicles;
  } catch (error) {
    console.error("No se pudo leer la guía de precios publicada; usando respaldo.", error);
  }

  if (country !== "CO") return [];
  if (isSanityConfigured && sanityClient) {
    return sanityClient.fetch<VehicleListing[]>(vehicleListingsQuery);
  }
  return mockVehicleListings;
}

/** Countries to offer in the selector. Colombia always has data (bundled fallback). */
export async function getAvailableCountries(): Promise<CountryCode[]> {
  let published: CountryCode[] = [];
  try {
    published = await readPublishedCountries();
  } catch (error) {
    console.error("No se pudo leer qué países están publicados.", error);
  }
  return published.includes("CO") ? published : ["CO", ...published];
}
