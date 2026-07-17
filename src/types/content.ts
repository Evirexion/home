import type { PortableTextBlock } from "@portabletext/types";

export type PostCategory = "corriente" | "innovations";

export interface Post {
  _id: string;
  title: string;
  slug: string;
  category: PostCategory;
  tag: string;
  excerpt: string;
  body: PortableTextBlock[];
  coverImage?: string;
  author: string;
  publishedAt: string;
  status?: "draft" | "pending" | "published";
}

export type VehicleType = "car" | "motorcycle" | "e-bike" | "scooter" | "bus";

export interface ChargingStation {
  _id: string;
  name: string;
  country: string;
  city: string;
  zone: string;
  address: string;
  lat: number;
  lng: number;
  connectorTypes: string[];
  vehicleTypes: VehicleType[];
  hours: string;
  contactPhone?: string;
  contactEmail?: string;
  operator: string;
  fastCharging: boolean;
}

/**
 * A vehicle listing from the E-VIREXION price guide. Sourced from the
 * consolidated master spreadsheet (brand/model/spec/suggested price range),
 * not a buy-vs-sell dealer quote — there is no per-condition or per-year
 * pricing in the source data, just a single suggested market price range.
 */
export interface VehicleListing {
  _id: string;
  brand: string;
  model: string;
  vehicleType: VehicleType;
  motor: string;
  battery: string;
  maxSpeed: string;
  range: string;
  features: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: "COP";
  source: string;
}
