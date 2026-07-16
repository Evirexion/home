"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { VEHICLE_TYPE_META, VEHICLE_TYPES } from "@/lib/vehicleTypes";
import { formatCOP } from "@/lib/format";
import type { VehicleCondition, VehiclePriceEntry, VehicleType } from "@/types/content";

const CONDITIONS: VehicleCondition[] = ["excellent", "good", "fair"];
const CONDITION_LABEL: Record<VehicleCondition, string> = {
  excellent: "Excelente",
  good: "Bueno",
  fair: "Regular",
};

const selectClass =
  "w-full rounded-xl border border-silver-300/15 bg-ink px-4 py-2.5 text-sm text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40 disabled:opacity-40";

export function Calculator({ entries }: { entries: VehiclePriceEntry[] }) {
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState<VehicleCondition | "">("");

  const brands = useMemo(() => {
    if (!vehicleType) return [];
    return Array.from(new Set(entries.filter((e) => e.vehicleType === vehicleType).map((e) => e.brand))).sort();
  }, [entries, vehicleType]);

  const models = useMemo(() => {
    if (!vehicleType || !brand) return [];
    return Array.from(
      new Set(entries.filter((e) => e.vehicleType === vehicleType && e.brand === brand).map((e) => e.model))
    ).sort();
  }, [entries, vehicleType, brand]);

  const matches = useMemo(() => {
    if (!vehicleType || !brand || !model || !condition) return [];
    return entries.filter(
      (e) => e.vehicleType === vehicleType && e.brand === brand && e.model === model && e.condition === condition
    );
  }, [entries, vehicleType, brand, model, condition]);

  const result = useMemo(() => {
    if (matches.length === 0) return null;
    const sellPrices = matches.map((m) => m.sellPrice);
    const buyPrices = matches.map((m) => m.buyPrice);
    const years = matches.map((m) => m.year).sort((a, b) => a - b);
    return {
      sellMin: Math.min(...sellPrices),
      sellMax: Math.max(...sellPrices),
      buyMin: Math.min(...buyPrices),
      buyMax: Math.max(...buyPrices),
      years,
    };
  }, [matches]);

  function handleVehicleType(value: VehicleType) {
    setVehicleType(value);
    setBrand("");
    setModel("");
    setCondition("");
  }

  function handleBrand(value: string) {
    setBrand(value);
    setModel("");
    setCondition("");
  }

  return (
    <div className="metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-6 md:p-8">
      <h2 className="text-lg font-semibold text-silver-100">Calculadora de precio de reventa</h2>
      <p className="mt-1 text-sm text-silver-500">
        Selecciona tipo de vehículo, marca, modelo y condición para ver un rango estimado.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Tipo de vehículo">
          <select
            value={vehicleType}
            onChange={(e) => handleVehicleType(e.target.value as VehicleType)}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {VEHICLE_TYPE_META[type].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Marca">
          <select
            value={brand}
            onChange={(e) => handleBrand(e.target.value)}
            disabled={!vehicleType}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Modelo">
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setCondition("");
            }}
            disabled={!brand}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Condición">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as VehicleCondition)}
            disabled={!model}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {result && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResultCard label="Precio de venta estimado" min={result.sellMin} max={result.sellMax} highlight />
            <ResultCard label="Precio de compra estimado (concesionario)" min={result.buyMin} max={result.buyMax} />
          </div>
          <p className="mt-4 text-xs text-silver-700">
            Basado en modelos {result.years[0]}–{result.years[result.years.length - 1]}. Datos ilustrativos, no
            reflejan precios reales de mercado.
          </p>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-silver-300">
      {label}
      {children}
    </label>
  );
}

function ResultCard({ label, min, max, highlight }: { label: string; min: number; max: number; highlight?: boolean }) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-5",
        highlight ? "border-electric/30 bg-electric/5" : "border-silver-300/15 bg-ink"
      )}
    >
      <p className="text-xs uppercase tracking-wide text-silver-500">{label}</p>
      <p className={clsx("mt-2 text-xl font-bold", highlight ? "brand-gradient-text" : "text-silver-100")}>
        {formatCOP(min)} – {formatCOP(max)}
      </p>
    </div>
  );
}
