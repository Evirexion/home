"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapFilters } from "./MapFilters";
import { LocationSelector } from "./LocationSelector";
import { StationCard } from "./StationCard";
import type { ChargingStation, VehicleType } from "@/types/content";
import { VEHICLE_TYPES } from "@/lib/vehicleTypes";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-silver-500">Cargando mapa...</div>
  ),
});

/** Picks the value with the most stations (ties broken alphabetically) so
 *  the default view lands on the best-covered country/city rather than
 *  whichever sorts first alphabetically. */
function mostCommon(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "";
}

export function MapExplorer({ stations }: { stations: ChargingStation[] }) {
  const countries = useMemo(() => Array.from(new Set(stations.map((s) => s.country))).sort(), [stations]);
  const [country, setCountry] = useState(() => mostCommon(stations.map((s) => s.country)));

  const cities = useMemo(
    () =>
      Array.from(new Set(stations.filter((s) => s.country === country).map((s) => s.city))).sort(),
    [stations, country]
  );
  const [city, setCity] = useState(() => mostCommon(stations.filter((s) => s.country === country).map((s) => s.city)));

  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<VehicleType[]>(VEHICLE_TYPES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleCountryChange(value: string) {
    setCountry(value);
    setCity(mostCommon(stations.filter((s) => s.country === value).map((s) => s.city)));
    setSelectedId(null);
  }

  function handleCityChange(value: string) {
    setCity(value);
    setSelectedId(null);
  }

  function toggleType(type: VehicleType) {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  // Stations in the selected city, before the vehicle-type/search filters
  // narrow them further. Drives map recentering so the view still jumps to
  // the right city even if the current vehicle-type filter would hide
  // every marker there.
  const cityStations = useMemo(
    () => stations.filter((s) => s.country === country && s.city === city),
    [stations, country, city]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cityStations.filter((station) => {
      const matchesType = station.vehicleTypes.some((t) => activeTypes.includes(t));
      const matchesQuery =
        !q || station.name.toLowerCase().includes(q) || station.zone.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [cityStations, query, activeTypes]);

  return (
    <div className="flex flex-col gap-6">
      <LocationSelector
        countries={countries}
        cities={cities}
        country={country}
        city={city}
        onCountryChange={handleCountryChange}
        onCityChange={handleCityChange}
      />

      <MapFilters query={query} onQueryChange={setQuery} activeTypes={activeTypes} onToggleType={toggleType} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <div className="flex max-h-[720px] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-[640px]">
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-silver-300/15 bg-ink-raised p-6 text-center text-sm text-silver-500">
              No encontramos estaciones con esos filtros.
            </p>
          )}
          {filtered.map((station) => (
            <StationCard
              key={station._id}
              station={station}
              active={station._id === selectedId}
              onSelect={() => setSelectedId(station._id)}
            />
          ))}
        </div>

        <div className="metal-edge h-[420px] overflow-hidden rounded-2xl border border-silver-300/15 lg:h-[640px]">
          <MapView
            stations={filtered}
            focusStations={cityStations}
            selectedStationId={selectedId}
            onSelectStation={setSelectedId}
          />
        </div>
      </div>

      <p className="text-xs text-silver-700">
        Datos de estaciones:{" "}
        <a
          href="https://openchargemap.org"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-silver-700/40 underline-offset-2 transition-colors hover:text-electric"
        >
          Open Charge Map
        </a>
      </p>
    </div>
  );
}
