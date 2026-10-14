import type { Metadata } from "next";
import { connection } from "next/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricesExplorer } from "@/components/prices/PricesExplorer";
import { getVehicleListings } from "@/lib/prices";

export const metadata: Metadata = {
  title: "Guía de precios",
  description: "Calculadora de precio y guía de precios de vehículos eléctricos en Colombia.",
};

export default async function PricesPage() {
  // Render per request so a publish from the Google Sheet shows up immediately,
  // instead of the build-time snapshot being cached for a year.
  await connection();
  const listings = await getVehicleListings();

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Guía de precios"
          title="Precios de vehículos eléctricos"
          description={`Calcula el precio sugerido de un modelo específico o explora la guía completa de ${listings.length} vehículos disponibles en Colombia.`}
        />
        <div className="mt-10">
          <PricesExplorer listings={listings} />
        </div>
      </Container>
    </div>
  );
}
