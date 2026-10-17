import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Innovación is hidden for now; send old links home instead of to a dead section.
  async redirects() {
    return [
      // One canonical address: www → evirexion.com.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.evirexion.com" }],
        destination: "https://evirexion.com/:path*",
        permanent: true,
      },
      { source: "/innovations", destination: "/", permanent: false },
      { source: "/innovations/:slug*", destination: "/", permanent: false },
    ];
  },
  images: {
    // Optimization is served by the Cloudflare Images binding declared in
    // wrangler.jsonc (see https://opennext.js.org/cloudflare/howtos/image)
    // once deployed; no sharp binary needed on Workers.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
