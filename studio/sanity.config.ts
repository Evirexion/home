import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { VehicleSyncTool } from "./tools/VehicleSyncTool";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "e-virexion",
  title: "E-VIREXION Studio",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
  tools: (prev) => [
    ...prev,
    {
      name: "vehicle-sync",
      title: "Sincronizar vehículos desde Sheet",
      component: VehicleSyncTool,
    },
  ],
});
