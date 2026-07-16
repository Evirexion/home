import Link from "next/link";
import clsx from "clsx";
import { MapPin, Newspaper, Cpu, Calculator, ArrowUpRight } from "lucide-react";
import type { ComponentType } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

interface CardDef {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  span: string;
  featured?: boolean;
}

const CARDS: CardDef[] = [
  {
    href: "/map",
    icon: MapPin,
    title: "Mapa de carga",
    description:
      "Encuentra estaciones de carga en Bogotá filtrables por tipo de vehículo: carros, motos, e-bikes, scooters y buses.",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    href: "/news",
    icon: Newspaper,
    title: "CORRIENTE",
    description: "Las noticias de movilidad eléctrica más relevantes de Colombia y LatAm.",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    href: "/innovations",
    icon: Cpu,
    title: "Innovación",
    description: "Tecnología, baterías y tendencias que redefinen el sector EV.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    href: "/prices",
    icon: Calculator,
    title: "Precios",
    description: "Calcula el valor de reventa o explora el precio de más de 180 vehículos.",
    span: "md:col-span-1 md:row-span-1",
  },
];

export function QuickAccessCards() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
          {CARDS.map((card, i) => (
            <Reveal key={card.href} delay={i * 0.08} className={card.span}>
              <QuickAccessCard {...card} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function QuickAccessCard({ href, icon: Icon, title, description, featured }: CardDef) {
  return (
    <Link
      href={href}
      className={clsx(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-silver-700/20 bg-ink-raised transition-all duration-300",
        "hover:-translate-y-1 hover:border-electric/50 hover:shadow-[0_0_44px_rgba(0,255,65,0.16)]",
        featured ? "min-h-[280px] p-8" : "min-h-[160px] p-6"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(120% 100% at 50% 100%, rgba(0,255,65,0.14), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-colors duration-500 group-hover:border-electric/20"
      />

      <div className="relative">
        <div
          className={clsx(
            "mb-4 flex items-center justify-center rounded-full bg-electric/10 text-electric transition-all duration-300 group-hover:bg-electric group-hover:text-ink group-hover:shadow-[0_0_26px_rgba(0,255,65,0.55)]",
            featured ? "h-14 w-14" : "h-11 w-11"
          )}
        >
          <Icon className={featured ? "h-6 w-6" : "h-5 w-5"} />
        </div>
        <h3 className={clsx("font-semibold text-silver-100", featured ? "text-2xl md:text-3xl" : "text-lg")}>
          {title}
        </h3>
        <p className={clsx("mt-2 text-silver-500", featured ? "max-w-sm text-base" : "text-sm")}>{description}</p>
      </div>

      <ArrowUpRight className="relative mt-6 h-4 w-4 text-silver-700 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric" />
    </Link>
  );
}
