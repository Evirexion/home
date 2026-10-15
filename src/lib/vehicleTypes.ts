import { Bike, Bus, Car, Motorbike, Scooter, Truck } from "lucide-react";
import type { VehicleType } from "@/types/content";

export const VEHICLE_TYPE_META: Record<VehicleType, { label: string; icon: typeof Car }> = {
  car: { label: "Carro", icon: Car },
  motorcycle: { label: "Moto", icon: Motorbike },
  "e-bike": { label: "E-bike", icon: Bike },
  scooter: { label: "Scooter", icon: Scooter },
  bus: { label: "Bus", icon: Bus },
  truck: { label: "Camión", icon: Truck },
  quad: { label: "Cuadriciclo", icon: Motorbike },
};

/** Types the charging map filters on (stations are classified by these). */
export const VEHICLE_TYPES: VehicleType[] = ["car", "motorcycle", "e-bike", "scooter", "bus"];

/** Types shown in the price guide filters and calculator. */
export const PRICE_VEHICLE_TYPES: VehicleType[] = [...VEHICLE_TYPES, "truck", "quad"];
