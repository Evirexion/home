import { BookOpen } from "lucide-react";
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
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/revista">
            <BookOpen className="h-4 w-4" /> Leer Revista
          </Button>
          <Button href="/map" variant="outline">
            Explorar el mapa de carga
          </Button>
        </div>
      </Container>

      <CurrentLine className="relative z-[5] h-6 w-full text-silver-700 opacity-70" />
    </section>
  );
}
