import { defineField, defineType } from "sanity";

export const vehiclePrice = defineType({
  name: "vehiclePrice",
  title: "Vehicle Price Entry",
  type: "document",
  fields: [
    defineField({
      name: "vehicleType",
      title: "Vehicle type",
      type: "string",
      options: {
        list: [
          { title: "Car", value: "car" },
          { title: "Motorcycle", value: "motorcycle" },
          { title: "E-bike", value: "e-bike" },
          { title: "Scooter", value: "scooter" },
          { title: "Bus", value: "bus" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "brand", title: "Brand", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "model", title: "Model", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "year", title: "Model year", type: "number", validation: (Rule) => Rule.required() }),
    defineField({
      name: "condition",
      title: "Condition",
      type: "string",
      options: {
        list: [
          { title: "Excellent", value: "excellent" },
          { title: "Good", value: "good" },
          { title: "Fair", value: "fair" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "buyPrice", title: "Buy price (dealer pays)", type: "number", validation: (Rule) => Rule.required() }),
    defineField({ name: "sellPrice", title: "Sell price (dealer asks)", type: "number", validation: (Rule) => Rule.required() }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "COP",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "model", subtitle: "brand" },
  },
});
