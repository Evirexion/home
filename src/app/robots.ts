import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/cuenta", "/news/internal"] }],
    sitemap: "https://evirexion.com/sitemap.xml",
  };
}
