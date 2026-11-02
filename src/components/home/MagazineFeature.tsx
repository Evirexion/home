import Link from "next/link";
import { BookOpen, Lock, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { EDITIONS } from "@/data/editions";

/**
 * Right under the hero: makes it obvious that E-VIREXION is a magazine,
 * with the latest edition's cover as the protagonist.
 */
export function MagazineFeature() {
  const edition = EDITIONS[0];
  if (!edition) return null;

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_40%,rgba(0,255,65,0.10),transparent_60%)]"
      />
      <Container className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
        {/* Cover */}
        <Reveal className="md:col-span-5">
          <Link
            href={`/revista/${edition.slug}`}
            aria-label={`Abrir la Edición ${edition.number}`}
            className="group relative mx-auto block w-[72%] max-w-[380px] md:w-full"
          >
            <div
              aria-hidden
              className="animate-hero-breathe absolute -inset-8 -z-10 rounded-[40px] blur-2xl"
              style={{ background: "radial-gradient(closest-side, rgba(0,255,65,.28), rgba(29,158,117,0) 75%)" }}
            />
            <div className="metal-edge relative overflow-hidden rounded-md border border-electric/30 shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(0,255,65,0.18)] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-0 group-hover:shadow-[0_40px_90px_rgba(0,0,0,0.65),0_0_60px_rgba(0,255,65,0.32)] md:-rotate-2">
              {/* Cover is a preview page, so it's public. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/revista/${edition.slug}/1`}
                alt={`Portada de la Edición ${edition.number} de E-VIREXION`}
                width={edition.width}
                height={edition.height}
                className="aspect-[1100/1556] w-full bg-ink-raised object-cover"
              />
              {/* Glossy sweep on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.14)_50%,transparent_70%)] transition-transform duration-1000 ease-out group-hover:translate-x-full"
              />
            </div>
            <span className="brand-gradient-bg absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full text-ink shadow-[0_0_24px_rgba(0,255,65,0.55)] md:-right-5 md:-top-5 md:h-14 md:w-14">
              <Zap className="h-6 w-6" fill="currentColor" />
            </span>
          </Link>
        </Reveal>

        {/* Copy */}
        <Reveal delay={0.1} className="md:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-electric">
            La revista · Edición {edition.number} · {edition.month}
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-silver-100 md:text-6xl">
            {edition.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="brand-gradient-text">{edition.title.split(" ").slice(-1)}</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-silver-300">
            E-VIREXION es una revista de movilidad eléctrica: historia, regulación, mercado y precios, contados con
            rigor y sin agenda. Hojéala aquí mismo, página por página.
          </p>

          <ul className="mt-8 grid gap-x-8 gap-y-3 text-silver-300 sm:grid-cols-2">
            {edition.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <Zap className="mt-1 h-3.5 w-3.5 shrink-0 text-electric" fill="currentColor" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/revista"
              className="brand-gradient-bg metal-edge inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-ink shadow-[0_4px_24px_rgba(0,255,65,0.22)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_6px_32px_rgba(0,255,65,0.38)]"
            >
              <BookOpen className="h-4 w-4" /> Leer Revista
            </Link>
            <span className="inline-flex items-center gap-2 text-sm text-silver-500">
              <Lock className="h-4 w-4" /> {edition.previewPages} páginas gratis · completa online con tu cuenta gratuita
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
