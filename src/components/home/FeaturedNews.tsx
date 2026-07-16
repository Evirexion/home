import { getPosts } from "@/lib/posts";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ArticleCard } from "@/components/news/ArticleCard";

export async function FeaturedNews() {
  const posts = (await getPosts()).slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Recién publicado"
            title="Lo último en CORRIENTE"
            description="Historias de movilidad eléctrica, política pública e infraestructura de carga en Colombia y la región."
          />
          <Button href="/news" variant="outline" className="shrink-0">
            Ver todas
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post._id} post={post} showCategory />
          ))}
        </div>
      </Container>
    </section>
  );
}
