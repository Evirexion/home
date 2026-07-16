export type PostCategory = "corriente" | "innovations";

export interface Post {
  _id: string;
  title: string;
  slug: string;
  category: PostCategory;
  tag: string;
  excerpt: string;
  body: string;
  coverImage?: string;
  author: string;
  publishedAt: string;
  status?: "draft" | "pending" | "published";
}

export type VehicleType = "car" | "motorcycle" | "e-bike" | "scooter" | "bus";

export interface ChargingStation {
  _id: string;
  name: string;
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

export type VehicleCondition = "excellent" | "good" | "fair";

export interface VehiclePriceEntry {
  _id: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  condition: VehicleCondition;
  buyPrice: number;
  sellPrice: number;
  currency: "COP";
}
