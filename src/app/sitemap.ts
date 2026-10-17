import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { EDITIONS } from "@/data/editions";

const BASE = "https://evirexion.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/revista", "/news", "/map", "/prices", "/contact", "/privacidad"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
  }));
  const editions = EDITIONS.map((e) => ({ url: `${BASE}/revista/${e.slug}` }));
  const posts = (await getPosts("corriente")).map((p) => ({ url: `${BASE}/news/${p.slug}`, lastModified: p.publishedAt }));
  return [...pages, ...editions, ...posts];
}
