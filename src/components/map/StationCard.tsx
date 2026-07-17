"use client";

import clsx from "clsx";
import { Clock, Mail, MapPin, Phone, Zap } from "lucide-react";
import { VEHICLE_TYPE_META } from "@/lib/vehicleTypes";
import type { ChargingStation } from "@/types/content";

export function StationCard({
  station,
  active,
  onSelect,
}: {
  station: ChargingStation;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "metal-edge w-full rounded-2xl border p-5 text-left ease-in-out transition-all duration-300",
        active
          ? "border-electric/40 bg-ink-raised shadow-[0_0_28px_rgba(0,255,65,0.14)]"
          : "border-silver-300/15 bg-ink-raised/60 hover:border-silver-300/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-silver-100">{station.name}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-teal">
            {station.zone} · {station.city}
          </p>
        </div>
        {station.fastCharging && (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-electric/30 px-2 py-1 text-[10px] font-medium uppercase text-electric">
            <Zap className="h-3 w-3" />
            Rápida
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start gap-2 text-sm text-silver-500">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{station.address}</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-silver-500">
        <Clock className="h-4 w-4 shrink-0" />
        <span>{station.hours}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {station.vehicleTypes.map((type) => {
          const Icon = VEHICLE_TYPE_META[type].icon;
          return (
            <span
              key={type}
              className="flex items-center gap-1 rounded-full border border-silver-300/15 px-2 py-1 text-[11px] text-silver-300"
            >
              <Icon className="h-3 w-3" />
              {VEHICLE_TYPE_META[type].label}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {station.connectorTypes.map((connector) => (
          <span key={connector} className="rounded-full bg-silver-100/5 px-2 py-1 text-[11px] text-silver-300">
            {connector}
          </span>
        ))}
      </div>

      {(station.contactPhone || station.contactEmail) && (
        <div className="mt-3 flex flex-col gap-1 border-t border-silver-300/10 pt-3 text-xs text-silver-500">
          {station.contactPhone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> {station.contactPhone}
            </span>
          )}
          {station.contactEmail && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> {station.contactEmail}
            </span>
          )}
        </div>
      )}
      <p className="mt-2 text-[11px] text-silver-700">Operado por {station.operator}</p>
    </button>
  );
}
