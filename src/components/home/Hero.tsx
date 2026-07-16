import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LightningBolt } from "@/components/icons/LightningBolt";
import { HologramAccent } from "@/components/ui/HologramAccent";
import { CurrentLine } from "@/components/ui/CurrentLine";
import { HeroBackground } from "@/components/home/HeroBackground";
import { HeroLogoReveal } from "@/components/home/HeroLogoReveal";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute left-1/2 top-[-120px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-electric/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute -right-40 bottom-[-80px] h-[380px] w-[480px] rounded-full bg-teal/12 blur-[110px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <HeroBackground />
      </div>

      <Container className="flex flex-col items-center py-28 text-center md:py-36">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-ink/40 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-electric backdrop-blur-sm">
          <LightningBolt className="h-3 w-3 animate-bolt-flicker" />
          Movilidad eléctrica · Colombia &amp; LatAm
        </div>

        <HeroLogoReveal />

        <p className="mt-7 text-lg text-silver-300 md:text-xl">Driving the Electric Shift</p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/news">Leer CORRIENTE</Button>
          <Button href="/map" variant="outline">
            Explorar el mapa de carga
          </Button>
        </div>

        <div className="mt-14 flex items-center gap-2 text-xs text-silver-500">
          <HologramAccent className="h-2 w-2" />
          Hecho en Colombia
        </div>
      </Container>

      <CurrentLine className="h-6 w-full text-silver-700 opacity-70" />
    </section>
  );
}
