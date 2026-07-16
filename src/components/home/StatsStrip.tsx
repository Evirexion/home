import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

const STATS = [
  { value: 8, suffix: "", label: "Estaciones de carga mapeadas en Bogotá" },
  { value: 180, suffix: "+", label: "Vehículos en la guía de precios" },
  { value: 1600, suffix: "+", label: "Buses eléctricos en TransMilenio" },
  { value: 68, suffix: "%", label: "Crecimiento anual en motos eléctricas" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-silver-300/10 bg-ink-raised/50 py-14">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 divide-silver-300/10 md:grid-cols-4 md:divide-x">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="text-center md:px-6 md:text-left first:md:pl-0"
            >
              <p className="font-display text-4xl font-bold md:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} className="brand-gradient-text" />
              </p>
              <p className="mt-2 text-sm text-silver-500">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
