import { Bike, Bus, Car, Motorbike, Scooter } from "lucide-react";
import type { VehicleType } from "@/types/content";

export const VEHICLE_TYPE_META: Record<VehicleType, { label: string; icon: typeof Car }> = {
  car: { label: "Carro", icon: Car },
  motorcycle: { label: "Moto", icon: Motorbike },
  "e-bike": { label: "E-bike", icon: Bike },
  scooter: { label: "Scooter", icon: Scooter },
  bus: { label: "Bus", icon: Bus },
};

export const VEHICLE_TYPES: VehicleType[] = ["car", "motorcycle", "e-bike", "scooter", "bus"];
