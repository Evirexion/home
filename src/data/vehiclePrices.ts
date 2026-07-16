import type { VehicleCondition, VehiclePriceEntry, VehicleType } from "@/types/content";

/**
 * Synthetic price-guide dataset (~180 rows): 15 brand/model lines x 4 model
 * years x 3 conditions. Values are illustrative placeholders, not real
 * market data. Structure mirrors the `vehiclePrice` document type in
 * /studio, so this can be swapped for a live Sanity/CSV feed (see
 * lib/prices.ts) without touching the UI. Replace with real figures via
 * the CSV import documented in README.md.
 */

interface VehicleLine {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  basePrice: number; // approximate new/current-year "excellent" COP price
}

const LINES: VehicleLine[] = [
  { vehicleType: "car", brand: "BYD", model: "Dolphin", basePrice: 99_990_000 },
  { vehicleType: "car", brand: "BYD", model: "Atto 3", basePrice: 149_990_000 },
  { vehicleType: "car", brand: "Renault", model: "Kwid E-Tech", basePrice: 89_900_000 },
  { vehicleType: "car", brand: "Chevrolet", model: "Bolt EV", basePrice: 165_000_000 },
  { vehicleType: "car", brand: "Kia", model: "Niro EV", basePrice: 189_000_000 },
  { vehicleType: "car", brand: "MG", model: "MG4 Electric", basePrice: 139_900_000 },
  { vehicleType: "motorcycle", brand: "AKT", model: "Nova E", basePrice: 8_990_000 },
  { vehicleType: "motorcycle", brand: "Segway", model: "E110S", basePrice: 11_500_000 },
  { vehicleType: "motorcycle", brand: "Honda", model: "U-Go", basePrice: 9_800_000 },
  { vehicleType: "e-bike", brand: "Oso Polar", model: "Urban", basePrice: 3_200_000 },
  { vehicleType: "e-bike", brand: "Mercurio", model: "E-City", basePrice: 2_890_000 },
  { vehicleType: "e-bike", brand: "Strida", model: "EVO", basePrice: 4_500_000 },
  { vehicleType: "scooter", brand: "Xiaomi", model: "Mi Electric Scooter 4 Pro", basePrice: 2_100_000 },
  { vehicleType: "scooter", brand: "Ninebot", model: "Max G30", basePrice: 2_450_000 },
  { vehicleType: "bus", brand: "BYD", model: "K9", basePrice: 1_450_000_000 },
];

const YEARS = [2021, 2022, 2023, 2024];
const CONDITIONS: { key: VehicleCondition; sellFactor: number; buySpread: number }[] = [
  { key: "excellent", sellFactor: 0.92, buySpread: 0.88 },
  { key: "good", sellFactor: 0.8, buySpread: 0.86 },
  { key: "fair", sellFactor: 0.65, buySpread: 0.82 },
];

const CURRENT_YEAR = 2026;
const ANNUAL_DEPRECIATION = 0.09;

function round(value: number, step = 50_000) {
  return Math.round(value / step) * step;
}

export const mockVehiclePrices: VehiclePriceEntry[] = LINES.flatMap((line) =>
  YEARS.flatMap((year) => {
    const age = Math.max(CURRENT_YEAR - year, 0);
    const ageFactor = Math.pow(1 - ANNUAL_DEPRECIATION, age);
    return CONDITIONS.map((condition) => {
      const sellPrice = round(line.basePrice * ageFactor * condition.sellFactor);
      const buyPrice = round(sellPrice * condition.buySpread);
      return {
        _id: `${line.brand}-${line.model}-${year}-${condition.key}`
          .toLowerCase()
          .replace(/\s+/g, "-"),
        vehicleType: line.vehicleType,
        brand: line.brand,
        model: line.model,
        year,
        condition: condition.key,
        buyPrice,
        sellPrice,
        currency: "COP" as const,
      };
    });
  })
);
