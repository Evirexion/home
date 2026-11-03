import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricesExplorer } from "@/components/prices/PricesExplorer";
import { COUNTRIES, DEFAULT_COUNTRY, getCountry } from "@/lib/countries";
import { getAvailableCountries, getVehicleListings } from "@/lib/prices";

export const metadata: Metadata = {
  title: "Guía de precios",
  description:
    "Calculadora de precio y guía de precios de vehículos eléctricos en Colombia, México, Brasil, Perú y Latinoamérica.",
};

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Render per request so a publish from the Google Sheet shows up immediately,
  // instead of the build-time snapshot being cached for a year.
  await connection();
  const { pais } = await searchParams;
  const available = await getAvailableCountries();
  const requested = getCountry(Array.isArray(pais) ? pais[0] : pais);
  const country =
    requested && available.includes(requested.code) ? requested : getCountry(DEFAULT_COUNTRY)!;
  const listings = await getVehicleListings(country.code);
  const options = COUNTRIES.filter((c) => available.includes(c.code));

  return (
    <div className="py-16 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="Guía de precios"
          title="Precios de vehículos eléctricos"
          description={`Calcula el precio sugerido de un modelo específico o explora la guía completa de ${listings.length} vehículos disponibles en ${country.name}.`}
        />

        {options.length > 1 && (
          <nav aria-label="País" className="mt-8 flex flex-wrap gap-2">
            {options.map((c) => (
              <Link
                key={c.code}
                href={c.code === DEFAULT_COUNTRY ? "/prices" : `/prices?pais=${c.slug}`}
                aria-current={c.code === country.code ? "page" : undefined}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium ease-in-out transition-all duration-300",
                  c.code === country.code
                    ? "brand-gradient-bg border-transparent text-ink"
                    : "border-silver-300/15 bg-ink-raised text-silver-300 hover:border-electric/40 hover:text-electric"
                )}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        <div className="mt-10">
          {/* key: reset the calculator's selections when the country changes */}
          <PricesExplorer key={country.code} listings={listings} />
        </div>
      </Container>
    </div>
  );
}
