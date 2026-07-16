import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Reveal } from "@/components/ui/Reveal";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "CORRIENTE",
  description: "Noticias de movilidad eléctrica en Colombia y Latinoamérica.",
};

export default async function NewsPage() {
  const posts = await getPosts("corriente");

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="CORRIENTE"
          title="Noticias de movilidad eléctrica"
          description="Política pública, infraestructura y mercado: lo que está pasando con los vehículos eléctricos en Colombia y la región."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post._id} delay={(i % 3) * 0.08}>
              <ArticleCard post={post} />
            </Reveal>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mt-10 rounded-2xl border border-silver-300/15 bg-ink-raised p-8 text-center text-silver-500">
            Todavía no hay noticias publicadas.
          </p>
        )}
      </Container>
    </div>
  );
}
