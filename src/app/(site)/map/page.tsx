import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MapExplorer } from "@/components/map/MapExplorer";
import { getStations } from "@/lib/stations";

export const metadata: Metadata = {
  title: "Mapa de carga",
  description: "Estaciones de carga para vehículos eléctricos en Bogotá, filtrables por tipo de vehículo.",
};

export default async function MapPage() {
  const stations = await getStations();

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Infraestructura"
          title="Mapa de carga en Bogotá"
          description="Encuentra estaciones de carga filtrables por tipo de vehículo, con conectores, horarios y contacto de cada operador."
        />
        <div className="mt-10">
          <MapExplorer stations={stations} />
        </div>
      </Container>
    </div>
  );
}
