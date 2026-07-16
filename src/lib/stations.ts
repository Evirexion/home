import { mockStations } from "@/data/stations";
import type { ChargingStation } from "@/types/content";
import { isSanityConfigured, sanityClient } from "./sanity/client";
import { stationsQuery } from "./sanity/queries";

export async function getStations(): Promise<ChargingStation[]> {
  if (isSanityConfigured && sanityClient) {
    return sanityClient.fetch<ChargingStation[]>(stationsQuery);
  }
  return mockStations;
}
