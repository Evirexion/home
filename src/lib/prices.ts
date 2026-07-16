import { mockVehiclePrices } from "@/data/vehiclePrices";
import type { VehiclePriceEntry } from "@/types/content";
import { isSanityConfigured, sanityClient } from "./sanity/client";
import { vehiclePricesQuery } from "./sanity/queries";

export async function getVehiclePrices(): Promise<VehiclePriceEntry[]> {
  if (isSanityConfigured && sanityClient) {
    return sanityClient.fetch<VehiclePriceEntry[]>(vehiclePricesQuery);
  }
  return mockVehiclePrices;
}
