"use client";

import { Globe, MapPin } from "lucide-react";

const selectClass =
  "rounded-full border border-silver-300/15 bg-ink-raised py-2.5 pl-10 pr-8 text-sm font-medium text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40 disabled:opacity-40";

export function LocationSelector({
  countries,
  cities,
  country,
  city,
  onCountryChange,
  onCityChange,
}: {
  countries: string[];
  cities: string[];
  country: string;
  city: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-electric" />
        <select value={country} onChange={(e) => onCountryChange(e.target.value)} className={selectClass}>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-electric" />
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={cities.length === 0}
          className={selectClass}
        >
          {cities.length === 0 && <option>Sin ciudades verificadas</option>}
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
