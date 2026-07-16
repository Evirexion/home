"use client";

import { Search } from "lucide-react";
import clsx from "clsx";
import { VEHICLE_TYPE_META, VEHICLE_TYPES } from "@/lib/vehicleTypes";
import type { VehicleType } from "@/types/content";

export function MapFilters({
  query,
  onQueryChange,
  activeTypes,
  onToggleType,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  activeTypes: VehicleType[];
  onToggleType: (type: VehicleType) => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-silver-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por zona o estación..."
          className="w-full rounded-full border border-silver-300/15 bg-ink-raised py-2.5 pl-10 pr-4 text-sm text-silver-100 placeholder:text-silver-700 outline-none ease-in-out transition-colors focus:border-electric/40"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {VEHICLE_TYPES.map((type) => {
          const meta = VEHICLE_TYPE_META[type];
          const Icon = meta.icon;
          const active = activeTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleType(type)}
              aria-pressed={active}
              className={clsx(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium ease-in-out transition-all duration-300",
                active
                  ? "brand-gradient-bg border-transparent text-ink shadow-[0_0_16px_rgba(0,255,65,0.25)]"
                  : "border-silver-300/15 text-silver-300 hover:border-electric/30 hover:text-electric"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
