import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy: the browser only loads scripts, images and
 * connections from the origins listed here, so injected code can't pull in
 * or send data to an attacker's server. Add an origin here before embedding
 * anything new (a video, a widget) or the browser will block it.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://cdn.sanity.io https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Always HTTPS, for two years, including subdomains.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Nobody can embed the site in a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Location is only for the charging map on this site; everything else is off.
  {
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Account pages and APIs carry personal data: never cache them anywhere.
      { source: "/cuenta/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/news/internal/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
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
