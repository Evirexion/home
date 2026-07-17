"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Search } from "lucide-react";
import { VEHICLE_TYPE_META, VEHICLE_TYPES } from "@/lib/vehicleTypes";
import { formatCOP } from "@/lib/format";
import type { VehicleListing, VehicleType } from "@/types/content";

export function PriceBrowser({ listings }: { listings: VehicleListing[] }) {
  const [vehicleType, setVehicleType] = useState<VehicleType | "all">("all");
  const [brand, setBrand] = useState("all");
  const [query, setQuery] = useState("");

  const brands = useMemo(() => {
    const source = vehicleType === "all" ? listings : listings.filter((l) => l.vehicleType === vehicleType);
    return Array.from(new Set(source.map((l) => l.brand))).sort();
  }, [listings, vehicleType]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (vehicleType !== "all" && l.vehicleType !== vehicleType) return false;
      if (brand !== "all" && l.brand !== brand) return false;
      if (q && !`${l.brand} ${l.model}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [listings, vehicleType, brand, query]);

  const chartData = useMemo(
    () =>
      filtered
        .filter((l) => l.priceMin !== null)
        .slice(0, 10)
        .map((l) => ({
          name: `${l.brand} ${l.model}`,
          Mínimo: l.priceMin as number,
          Máximo: l.priceMax as number,
        })),
    [filtered]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <select
          value={vehicleType}
          onChange={(e) => {
            setVehicleType(e.target.value as VehicleType | "all");
            setBrand("all");
          }}
          className={selectClass}
        >
          <option value="all">Todos los vehículos</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {VEHICLE_TYPE_META[t].label}
            </option>
          ))}
        </select>

        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
          <option value="all">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-silver-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar modelo..."
            className="w-full rounded-full border border-silver-300/15 bg-ink-raised py-2.5 pl-10 pr-4 text-sm text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40"
          />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="metal-edge h-72 rounded-2xl border border-silver-300/15 bg-ink-raised p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid stroke="rgba(244,246,245,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9aa3a0", fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={55}
              />
              <YAxis tick={{ fill: "#9aa3a0", fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ background: "#12140f", border: "1px solid rgba(244,246,245,0.15)", borderRadius: 8 }}
                labelStyle={{ color: "#f4f6f5" }}
                formatter={(value) => formatCOP(Number(value))}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#9aa3a0" }} />
              <Bar dataKey="Mínimo" fill="#1d9e75" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Máximo" fill="#00ff41" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="metal-edge max-h-[520px] overflow-auto rounded-2xl border border-silver-300/15 bg-ink-raised">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-ink-raised text-xs uppercase tracking-wide text-silver-500">
            <tr>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Autonomía</th>
              <th className="px-4 py-3 text-right font-medium">Precio sugerido</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l._id} className="border-t border-silver-300/10 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-silver-100">{l.brand}</td>
                <td className="px-4 py-3 text-silver-300">{l.model}</td>
                <td className="px-4 py-3 text-silver-500">{VEHICLE_TYPE_META[l.vehicleType].label}</td>
                <td className="px-4 py-3 text-silver-500">{l.range || "N/D"}</td>
                <td className="px-4 py-3 text-right font-medium text-electric">
                  {l.priceMin === null
                    ? "N/D"
                    : l.priceMin === l.priceMax
                      ? formatCOP(l.priceMin)
                      : `${formatCOP(l.priceMin)} – ${formatCOP(l.priceMax!)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-silver-500">Sin resultados.</p>}
      </div>
      <p className="text-xs text-silver-700">{filtered.length} vehículos</p>
    </div>
  );
}

const selectClass =
  "rounded-full border border-silver-300/15 bg-ink-raised px-4 py-2.5 text-sm text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40";
