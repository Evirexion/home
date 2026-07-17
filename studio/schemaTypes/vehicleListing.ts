import { defineField, defineType } from "sanity";

const VEHICLE_TYPES = [
  { title: "Car", value: "car" },
  { title: "Motorcycle", value: "motorcycle" },
  { title: "E-bike", value: "e-bike" },
  { title: "Scooter", value: "scooter" },
  { title: "Bus", value: "bus" },
];

export const vehicleListing = defineType({
  name: "vehicleListing",
  title: "Vehicle Listing",
  type: "document",
  fields: [
    defineField({ name: "brand", title: "Brand", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "model", title: "Model", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "vehicleType",
      title: "Vehicle type",
      type: "string",
      options: { list: VEHICLE_TYPES },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "motor", title: "Motor", type: "string" }),
    defineField({ name: "battery", title: "Battery", type: "string" }),
    defineField({ name: "maxSpeed", title: "Max speed", type: "string" }),
    defineField({ name: "range", title: "Range / autonomy", type: "string" }),
    defineField({ name: "features", title: "Key features", type: "text", rows: 3 }),
    defineField({ name: "priceMin", title: "Suggested price — min (COP)", type: "number" }),
    defineField({ name: "priceMax", title: "Suggested price — max (COP)", type: "number" }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "COP",
      readOnly: true,
    }),
    defineField({ name: "source", title: "Source", type: "string" }),
  ],
  preview: {
    select: { title: "model", subtitle: "brand" },
  },
});
