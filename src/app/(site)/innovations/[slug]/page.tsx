import type { Metadata } from "next";
import { ArticleDetail } from "@/components/news/ArticleDetail";
import { getPostBySlug } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Innovación" };
}

export default async function InnovationArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleDetail slug={slug} category="innovations" />;
}
