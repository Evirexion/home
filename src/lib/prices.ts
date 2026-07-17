import { mockVehicleListings } from "@/data/vehicles";
import type { VehicleListing } from "@/types/content";
import { isSanityConfigured, sanityClient } from "./sanity/client";
import { vehicleListingsQuery } from "./sanity/queries";

export async function getVehicleListings(): Promise<VehicleListing[]> {
  if (isSanityConfigured && sanityClient) {
    return sanityClient.fetch<VehicleListing[]>(vehicleListingsQuery);
  }
  return mockVehicleListings;
}
