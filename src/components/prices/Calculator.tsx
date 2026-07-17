"use client";

import { useMemo, useState } from "react";
import { Battery, Gauge, Route, Zap } from "lucide-react";
import { VEHICLE_TYPE_META, VEHICLE_TYPES } from "@/lib/vehicleTypes";
import { formatCOP } from "@/lib/format";
import type { VehicleListing, VehicleType } from "@/types/content";

const selectClass =
  "w-full rounded-xl border border-silver-300/15 bg-ink px-4 py-2.5 text-sm text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40 disabled:opacity-40";

export function Calculator({ listings }: { listings: VehicleListing[] }) {
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [brand, setBrand] = useState("");
  const [modelId, setModelId] = useState("");

  const brands = useMemo(() => {
    if (!vehicleType) return [];
    return Array.from(new Set(listings.filter((l) => l.vehicleType === vehicleType).map((l) => l.brand))).sort();
  }, [listings, vehicleType]);

  const models = useMemo(() => {
    if (!vehicleType || !brand) return [];
    return listings
      .filter((l) => l.vehicleType === vehicleType && l.brand === brand)
      .sort((a, b) => a.model.localeCompare(b.model));
  }, [listings, vehicleType, brand]);

  const result = models.find((m) => m._id === modelId) ?? null;

  function handleVehicleType(value: VehicleType) {
    setVehicleType(value);
    setBrand("");
    setModelId("");
  }

  function handleBrand(value: string) {
    setBrand(value);
    setModelId("");
  }

  return (
    <div className="metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-6 md:p-8">
      <h2 className="text-lg font-semibold text-silver-100">Calculadora de precio</h2>
      <p className="mt-1 text-sm text-silver-500">
        Selecciona tipo de vehículo, marca y modelo para ver el precio sugerido y sus especificaciones.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            disabled={!brand}
            className={selectClass}
          >
            <option value="">Selecciona...</option>
            {models.map((m) => (
              <option key={m._id} value={m._id}>
                {m.model}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {result && (
        <div className="mt-8">
          <div className="rounded-xl border border-electric/30 bg-electric/5 p-5">
            <p className="text-xs uppercase tracking-wide text-silver-500">Precio sugerido</p>
            <p className="brand-gradient-text mt-2 text-2xl font-bold">
              {result.priceMin === null
                ? "No disponible"
                : result.priceMin === result.priceMax
                  ? formatCOP(result.priceMin)
                  : `${formatCOP(result.priceMin)} – ${formatCOP(result.priceMax!)}`}
            </p>
            <p className="mt-1 text-xs text-silver-700">Fuente: {result.source}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Spec icon={Zap} label="Motor" value={result.motor} />
            <Spec icon={Battery} label="Batería" value={result.battery} />
            <Spec icon={Gauge} label="Vel. máxima" value={result.maxSpeed} />
            <Spec icon={Route} label="Autonomía" value={result.range} />
          </div>

          <p className="mt-4 text-sm text-silver-300">{result.features}</p>
        </div>
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

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-silver-300/15 bg-ink p-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-silver-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 text-sm text-silver-100">{value || "N/D"}</p>
    </div>
  );
}
