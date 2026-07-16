import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Post } from "@/types/content";

const CATEGORY_LABEL: Record<Post["category"], string> = {
  corriente: "CORRIENTE",
  innovations: "Innovación",
};

const CATEGORY_GLOW: Record<Post["category"], string> = {
  corriente: "rgba(0, 255, 65, 0.18)",
  innovations: "rgba(29, 158, 117, 0.22)",
};

export function ArticleCard({ post, showCategory = false }: { post: Post; showCategory?: boolean }) {
  const basePath = post.category === "corriente" ? "/news" : "/innovations";
  const glow = CATEGORY_GLOW[post.category];

  return (
    <Link
      href={`${basePath}/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-silver-700/20 bg-ink-raised p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-electric/40 hover:shadow-[0_0_40px_var(--card-glow)]"
      style={{ "--card-glow": glow } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 80% at 100% 0%, ${glow}, transparent 60%)` }}
      />
      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 flex items-center gap-2">
          {showCategory && <Badge variant="solid">{CATEGORY_LABEL[post.category]}</Badge>}
          <Badge variant="silver">{post.tag}</Badge>
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
      </div>
    </Link>
  );
}
