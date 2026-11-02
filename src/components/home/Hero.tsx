import Link from "next/link";
import { BookOpen, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CurrentLine } from "@/components/ui/CurrentLine";
import { PlasmaField } from "@/components/home/PlasmaField";
import { GridFloor } from "@/components/home/GridFloor";
import { Sparks } from "@/components/home/Sparks";
import { HeroStage } from "@/components/home/HeroStage";
import { HeroDepth } from "@/components/home/HeroDepth";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[620px] flex-col overflow-hidden md:min-h-[760px]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <HeroDepth />
        <PlasmaField />
        <GridFloor />
        <Sparks />
      </div>

      <div className="relative flex-1">
        <HeroStage />
      </div>

      <Container className="relative z-[5] flex flex-col items-center gap-6 pb-16 md:pb-20">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-silver-300 md:text-xs">
          <span className="text-electric">Revista de movilidad eléctrica</span>
          <span aria-hidden className="hidden h-1 w-1 rounded-full bg-electric/70 sm:inline-block" />
          <span>Colombia y Latinoamérica</span>
        </p>
        <div className="flex flex-col items-center gap-5">
          <Link
            href="/revista"
            className="group relative inline-flex items-center justify-center gap-3 rounded-full px-10 py-5 [font-family:var(--font-display),system-ui,sans-serif] text-lg font-bold text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] md:px-14 md:py-6 md:text-2xl"
          >
            <span aria-hidden className="animate-cta-pulse absolute inset-0 rounded-full" />
            <span
              aria-hidden
              className="brand-gradient-bg metal-edge absolute inset-0 rounded-full shadow-[0_0_40px_rgba(0,255,65,0.45),0_8px_32px_rgba(0,255,65,0.25)] transition-shadow duration-300 group-hover:shadow-[0_0_64px_rgba(0,255,65,0.65),0_10px_40px_rgba(0,255,65,0.35)]"
            />
            <BookOpen className="relative h-6 w-6 md:h-7 md:w-7" />
            <span className="relative">Leer Revista</span>
            <Zap className="relative h-5 w-5 transition-transform duration-300 group-hover:rotate-12 md:h-6 md:w-6" fill="currentColor" />
          </Link>
          <Button href="/map" variant="outline">
            Explorar el mapa de carga
          </Button>
        </div>
      </Container>

      <CurrentLine className="relative z-[5] h-6 w-full text-silver-700 opacity-70" />
    </section>
  );
}
