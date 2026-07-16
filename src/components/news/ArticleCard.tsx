import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Post } from "@/types/content";

const CATEGORY_LABEL: Record<Post["category"], string> = {
  corriente: "CORRIENTE",
  innovations: "Innovación",
};

export function ArticleCard({ post, showCategory = false }: { post: Post; showCategory?: boolean }) {
  const basePath = post.category === "corriente" ? "/news" : "/innovations";

  return (
    <Link
      href={`${basePath}/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-silver-700/20 bg-ink-raised p-6 transition-all duration-200 hover:border-electric/40 hover:shadow-[0_0_28px_rgba(0,255,65,0.1)]"
    >
      <div className="mb-4 flex items-center gap-2">
        {showCategory && <Badge variant="solid">{CATEGORY_LABEL[post.category]}</Badge>}
        <Badge>{post.tag}</Badge>
      </div>
      <h3 className="text-lg font-semibold text-silver-100 transition-colors group-hover:text-electric">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-sm text-silver-500">{post.excerpt}</p>
      <div className="mt-5 flex items-center justify-between text-xs text-silver-700">
        <span>{post.author}</span>
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>
    </Link>
  );
}
