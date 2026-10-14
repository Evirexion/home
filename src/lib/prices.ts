import { mockVehicleListings } from "@/data/vehicles";
import type { VehicleListing } from "@/types/content";
import { readPublishedPrices } from "./priceStore";
import { isSanityConfigured, sanityClient } from "./sanity/client";
import { vehicleListingsQuery } from "./sanity/queries";

/**
 * Order of precedence:
 * 1. What was last published from the Google Sheet (Cloudflare KV)
 * 2. Sanity, if a project is connected
 * 3. The bundled list in src/data/vehicles.ts
 */
export async function getVehicleListings(): Promise<VehicleListing[]> {
  try {
    const published = await readPublishedPrices();
    if (published && published.vehicles.length > 0) return published.vehicles;
  } catch (error) {
    console.error("No se pudo leer la guía de precios publicada; usando respaldo.", error);
  }

  if (isSanityConfigured && sanityClient) {
    return sanityClient.fetch<VehicleListing[]>(vehicleListingsQuery);
  }
  return mockVehicleListings;
}
