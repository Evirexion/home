import { defineCliConfig } from "sanity/cli";

/**
 * Required by `sanity build` / `sanity deploy`. Reads the same env vars as
 * sanity.config.ts, so `studio/.env` drives both.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
});
