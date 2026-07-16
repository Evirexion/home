import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LightningBolt } from "@/components/icons/LightningBolt";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-120px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-electric/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute -right-40 bottom-[-80px] h-[380px] w-[480px] rounded-full bg-teal/10 blur-[110px]" />
      </div>

      <Container className="flex flex-col items-center py-28 text-center md:py-36">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-electric/30 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-electric">
          <LightningBolt className="h-3 w-3 animate-bolt-flicker" />
          Movilidad eléctrica · Colombia &amp; LatAm
        </div>

        <Logo size="lg" />

        <p className="mt-7 text-lg text-silver-300 md:text-xl">Driving the Electric Shift</p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/news">Leer CORRIENTE</Button>
          <Button href="/map" variant="outline">
            Explorar el mapa de carga
          </Button>
        </div>
      </Container>
    </section>
  );
}
