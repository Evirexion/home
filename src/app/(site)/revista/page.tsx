import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCurrentUser } from "@/lib/accounts";
import { EDITIONS } from "@/data/editions";

export const metadata: Metadata = {
  title: "Revista",
  description: "Lee E-VIREXION, la revista de movilidad eléctrica de Colombia y Latinoamérica.",
};

export default async function MagazinePage({ searchParams }: { searchParams: Promise<{ bienvenida?: string }> }) {
  const user = await getCurrentUser();
  const { bienvenida } = await searchParams;
  const latest = EDITIONS[0];

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Revista digital"
          title="E-VIREXION"
          description="Historia, regulación, mercado y la guía de precios de la movilidad eléctrica en Colombia. Hojea la revista aquí mismo."
        />
        {user && bienvenida && (
          <p className="mt-6 rounded-xl border border-electric/30 bg-electric/5 px-4 py-3 text-sm text-silver-100">
            ¡Bienvenido, {user.name}! Tu cuenta está activa.
          </p>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-12">
          {EDITIONS.map((edition) => (
            <Link
              key={edition.slug}
              href={`/revista/${edition.slug}${bienvenida ? "?bienvenida=1" : ""}`}
              className="group metal-edge grid overflow-hidden rounded-2xl border border-silver-300/15 bg-ink-raised md:col-span-12 md:grid-cols-12"
            >
              <div className="relative bg-ink md:col-span-5">
                {/* Cover is a preview page, so it's public. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/revista/${edition.slug}/1`}
                  alt={`Portada Edición ${edition.number}`}
                  className="aspect-[1100/1556] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:col-span-7 md:p-10">
                <p className="text-xs uppercase tracking-[0.3em] text-electric">
                  Edición {edition.number} · {edition.month}
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-silver-100 md:text-4xl">{edition.title}</h2>
                <ul className="mt-6 space-y-2 text-silver-300">
                  {edition.highlights.map((h) => (
                    <li
                      key={h}
                      className="relative pl-5 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-electric"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <span className="brand-gradient-bg metal-edge inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-ink">
                    <BookOpen className="h-4 w-4" /> {user ? "Leer edición completa" : "Ver vista previa"}
                  </span>
                  {!user && (
                    <span className="inline-flex items-center gap-2 text-sm text-silver-500">
                      <Lock className="h-4 w-4" /> {edition.previewPages} páginas gratis · {edition.pages} con tu cuenta
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!user && latest && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-electric/25 bg-electric/5 p-6">
            <p className="text-silver-100">
              Crea tu cuenta gratis y lee las {latest.pages} páginas de cada edición.
            </p>
            <div className="flex gap-3">
              <Link href="/cuenta/registro" className="brand-gradient-bg rounded-full px-5 py-2 text-sm font-semibold text-ink">
                Crear cuenta gratis
              </Link>
              <Link href="/cuenta/ingresar" className="rounded-full border border-silver-300/20 px-5 py-2 text-sm text-silver-300">
                Ingresar
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
