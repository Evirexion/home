import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NextEditionBadge } from "@/components/magazine/NextEditionBadge";
import { getCurrentUser } from "@/lib/accounts";
import { EDITIONS } from "@/data/editions";

export const metadata: Metadata = {
  title: "Ediciones",
  description: "Todas las ediciones anteriores de E-VIREXION, la revista de movilidad eléctrica de Colombia y Latinoamérica.",
};

export default async function EditionsPage() {
  const user = await getCurrentUser();
  const latest = EDITIONS[0];
  // The current edition lives in /revista; this archive keeps the earlier ones.
  const previous = EDITIONS.slice(1);

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Archivo"
          title="Ediciones"
          description="Cada mes, una edición nueva. Aquí quedan guardadas las anteriores para leerlas online cuando quieras."
        />
        <NextEditionBadge className="mt-6" />

        {previous.length === 0 ? (
          <p className="mt-10 text-silver-500">Pronto encontrarás aquí las ediciones anteriores.</p>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {previous.map((edition) => (
              <Link
                key={edition.slug}
                href={`/revista/${edition.slug}`}
                className="group metal-edge flex flex-col overflow-hidden rounded-2xl border border-silver-300/15 bg-ink-raised transition-colors hover:border-electric/40"
              >
                <div className="overflow-hidden bg-ink">
                  {/* Cover is a preview page, so it's public. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/revista/${edition.slug}/1`}
                    alt={`Portada Edición ${edition.number}`}
                    width={edition.width}
                    height={edition.height}
                    loading="lazy"
                    className="aspect-[1100/1556] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-electric">
                    Edición {edition.number} · {edition.month}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-silver-100">{edition.title}</h2>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-electric">
                    <BookOpen className="h-4 w-4" /> {user ? "Leer edición" : "Ver vista previa"}
                  </span>
                  {!user && (
                    <span className="mt-2 inline-flex items-center gap-2 text-xs text-silver-500">
                      <Lock className="h-3.5 w-3.5" /> {edition.previewPages} páginas gratis · completa con tu cuenta
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {latest && (
          <Link
            href="/revista"
            className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-electric/25 bg-electric/5 p-6 transition-colors hover:border-electric/50"
          >
            <p className="text-silver-100">
              ¿Buscas la última? La <strong className="text-electric">Edición {latest.number}</strong> · {latest.month} está
              en Revista.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-electric">
              Ir a la Revista <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        )}
      </Container>
    </div>
  );
}
