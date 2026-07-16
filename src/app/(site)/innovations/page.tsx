import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Reveal } from "@/components/ui/Reveal";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Innovación",
  description: "Tecnología, baterías y tendencias que redefinen el sector de la movilidad eléctrica.",
};

export default async function InnovationsPage() {
  const posts = await getPosts("innovations");

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Innovación"
          title="Tecnología detrás del cambio eléctrico"
          description="Baterías, powertrains, software y las tendencias que están redefiniendo el sector EV en Colombia y el mundo."
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
            Todavía no hay artículos publicados.
          </p>
        )}
      </Container>
    </div>
  );
}
