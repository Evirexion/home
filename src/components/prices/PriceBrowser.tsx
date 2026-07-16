"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Search } from "lucide-react";
import { VEHICLE_TYPE_META, VEHICLE_TYPES } from "@/lib/vehicleTypes";
import { formatCOP } from "@/lib/format";
import type { VehicleCondition, VehiclePriceEntry, VehicleType } from "@/types/content";

const CONDITION_LABEL: Record<VehicleCondition, string> = {
  excellent: "Excelente",
  good: "Bueno",
  fair: "Regular",
};

export function PriceBrowser({ entries }: { entries: VehiclePriceEntry[] }) {
  const [vehicleType, setVehicleType] = useState<VehicleType | "all">("all");
  const [brand, setBrand] = useState("all");
  const [query, setQuery] = useState("");

  const brands = useMemo(() => {
    const source = vehicleType === "all" ? entries : entries.filter((e) => e.vehicleType === vehicleType);
    return Array.from(new Set(source.map((e) => e.brand))).sort();
  }, [entries, vehicleType]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (vehicleType !== "all" && e.vehicleType !== vehicleType) return false;
      if (brand !== "all" && e.brand !== brand) return false;
      if (q && !`${e.brand} ${e.model}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, vehicleType, brand, query]);

  const chartData = useMemo(() => {
    const groups = new Map<string, { name: string; buy: number[]; sell: number[] }>();
    for (const e of filtered) {
      const key = `${e.brand} ${e.model}`;
      if (!groups.has(key)) groups.set(key, { name: key, buy: [], sell: [] });
      const group = groups.get(key)!;
      group.buy.push(e.buyPrice);
      group.sell.push(e.sellPrice);
    }
    return Array.from(groups.values())
      .slice(0, 8)
      .map((g) => ({
        name: g.name,
        Compra: Math.round(g.buy.reduce((a, b) => a + b, 0) / g.buy.length),
        Venta: Math.round(g.sell.reduce((a, b) => a + b, 0) / g.sell.length),
      }));
  }, [filtered]);

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
              <Bar dataKey="Compra" fill="#1d9e75" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Venta" fill="#00ff41" radius={[4, 4, 0, 0]} />
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
              <th className="px-4 py-3 font-medium">Año</th>
              <th className="px-4 py-3 font-medium">Condición</th>
              <th className="px-4 py-3 text-right font-medium">Compra</th>
              <th className="px-4 py-3 text-right font-medium">Venta</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e._id} className="border-t border-silver-300/10 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-silver-100">{e.brand}</td>
                <td className="px-4 py-3 text-silver-300">{e.model}</td>
                <td className="px-4 py-3 text-silver-500">{e.year}</td>
                <td className="px-4 py-3 text-silver-500">{CONDITION_LABEL[e.condition]}</td>
                <td className="px-4 py-3 text-right text-silver-300">{formatCOP(e.buyPrice)}</td>
                <td className="px-4 py-3 text-right font-medium text-electric">{formatCOP(e.sellPrice)}</td>
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
