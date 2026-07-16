import Link from "next/link";
import { MapPin, Newspaper, Cpu, Calculator, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

const CARDS = [
  {
    href: "/map",
    icon: MapPin,
    title: "Mapa de carga",
    description: "Encuentra estaciones de carga en Bogotá filtrables por tipo de vehículo.",
  },
  {
    href: "/news",
    icon: Newspaper,
    title: "CORRIENTE",
    description: "Las noticias de movilidad eléctrica más relevantes de Colombia y LatAm.",
  },
  {
    href: "/innovations",
    icon: Cpu,
    title: "Innovación",
    description: "Tecnología, baterías y tendencias que están redefiniendo el sector EV.",
  },
  {
    href: "/prices",
    icon: Calculator,
    title: "Precios",
    description: "Calcula el valor de reventa o explora el precio de más de 180 vehículos.",
  },
];

export function QuickAccessCards() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-silver-700/20 bg-ink-raised p-6 transition-all duration-200 hover:border-electric/40 hover:shadow-[0_0_28px_rgba(0,255,65,0.12)]"
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-electric/10 text-electric transition-colors group-hover:bg-electric group-hover:text-ink">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-silver-100">{title}</h3>
                <p className="mt-2 text-sm text-silver-500">{description}</p>
              </div>
              <ArrowUpRight className="mt-6 h-4 w-4 text-silver-700 transition-colors group-hover:text-electric" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
