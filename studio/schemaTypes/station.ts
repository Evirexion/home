import { defineField, defineType } from "sanity";

const VEHICLE_TYPES = [
  { title: "Car", value: "car" },
  { title: "Motorcycle", value: "motorcycle" },
  { title: "E-bike", value: "e-bike" },
  { title: "Scooter", value: "scooter" },
  { title: "Bus", value: "bus" },
];

export const station = defineType({
  name: "station",
  title: "Charging Station",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      initialValue: "Colombia",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "city", title: "City", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "zone", title: "Zone / Locality", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "address", title: "Address", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "lat", title: "Latitude", type: "number", validation: (Rule) => Rule.required() }),
    defineField({ name: "lng", title: "Longitude", type: "number", validation: (Rule) => Rule.required() }),
    defineField({
      name: "connectorTypes",
      title: "Connector types",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "vehicleTypes",
      title: "Supported vehicle types",
      type: "array",
      of: [{ type: "string", options: { list: VEHICLE_TYPES } }],
      options: { layout: "list" },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: "hours", title: "Operating hours", type: "string" }),
    defineField({ name: "contactPhone", title: "Contact phone", type: "string" }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string" }),
    defineField({ name: "operator", title: "Operator", type: "string" }),
    defineField({ name: "fastCharging", title: "Fast charging available", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "name", subtitle: "zone" },
  },
});
