import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricesExplorer } from "@/components/prices/PricesExplorer";
import { getVehiclePrices } from "@/lib/prices";

export const metadata: Metadata = {
  title: "Precios",
  description: "Calculadora de precio de reventa y guía de precios de vehículos eléctricos en Colombia.",
};

export default async function PricesPage() {
  const entries = await getVehiclePrices();

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Guía de precios"
          title="Precios de vehículos eléctricos"
          description="Calcula un rango estimado de reventa o explora el precio de compra y venta de más de 180 vehículos."
        />
        <div className="mt-10">
          <PricesExplorer entries={entries} />
        </div>
      </Container>
    </div>
  );
}
