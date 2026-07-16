import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ArticleBody } from "@/components/news/ArticleBody";
import { getPostBySlug } from "@/lib/posts";
import type { PostCategory } from "@/types/content";

const BASE_PATH: Record<PostCategory, string> = { corriente: "/news", innovations: "/innovations" };
const CATEGORY_LABEL: Record<PostCategory, string> = { corriente: "CORRIENTE", innovations: "Innovación" };

export async function ArticleDetail({ slug, category }: { slug: string; category: PostCategory }) {
  const post = await getPostBySlug(slug);
  if (!post || post.category !== category) notFound();

  return (
    <article className="py-16 md:py-20">
      <Container className="max-w-3xl">
        <Link
          href={BASE_PATH[category]}
          className="inline-flex items-center gap-2 text-sm text-silver-500 ease-in-out transition-colors hover:text-electric"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a {CATEGORY_LABEL[category]}
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <Badge variant="solid">{CATEGORY_LABEL[category]}</Badge>
          <Badge variant="silver">{post.tag}</Badge>
        </div>

        <h1 className="mt-4 text-3xl font-bold text-silver-100 md:text-4xl">{post.title}</h1>

        <div className="mt-4 flex items-center gap-3 text-sm text-silver-500">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>

        <div className="mt-10">
          <ArticleBody value={post.body} />
        </div>
      </Container>
    </article>
  );
}
