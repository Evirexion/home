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

export function MapExplorer({ stations }: { stations: ChargingStation[] }) {
  const countries = useMemo(() => Array.from(new Set(stations.map((s) => s.country))).sort(), [stations]);
  const [country, setCountry] = useState(countries[0] ?? "");

  const cities = useMemo(
    () =>
      Array.from(new Set(stations.filter((s) => s.country === country).map((s) => s.city))).sort(),
    [stations, country]
  );
  const [city, setCity] = useState(cities[0] ?? "");

  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<VehicleType[]>(VEHICLE_TYPES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleCountryChange(value: string) {
    setCountry(value);
    const nextCities = Array.from(new Set(stations.filter((s) => s.country === value).map((s) => s.city))).sort();
    setCity(nextCities[0] ?? "");
    setSelectedId(null);
  }

  function handleCityChange(value: string) {
    setCity(value);
    setSelectedId(null);
  }

  function toggleType(type: VehicleType) {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stations.filter((station) => {
      const matchesLocation = station.country === country && station.city === city;
      const matchesType = station.vehicleTypes.some((t) => activeTypes.includes(t));
      const matchesQuery =
        !q || station.name.toLowerCase().includes(q) || station.zone.toLowerCase().includes(q);
      return matchesLocation && matchesType && matchesQuery;
    });
  }, [stations, country, city, query, activeTypes]);

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
          <MapView stations={filtered} selectedStationId={selectedId} onSelectStation={setSelectedId} />
        </div>
      </div>
    </div>
  );
}
