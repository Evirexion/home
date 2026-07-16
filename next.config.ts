import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Optimization is served by the Cloudflare Images binding declared in
    // wrangler.jsonc (see https://opennext.js.org/cloudflare/howtos/image)
    // once deployed; no sharp binary needed on Workers.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
