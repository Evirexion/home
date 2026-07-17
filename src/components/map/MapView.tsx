"use client";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { ChargingStation } from "@/types/content";
import "leaflet/dist/leaflet.css";

const BOGOTA_CENTER: [number, number] = [4.698, -74.07];

function stationIcon(active: boolean) {
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block; width:${active ? 20 : 14}px; height:${active ? 20 : 14}px; border-radius:9999px;
      background:radial-gradient(circle at 35% 30%, #9effd8, #00ff41 55%, #1d9e75 100%);
      box-shadow:0 0 ${active ? 18 : 10}px rgba(0,255,65,${active ? 0.85 : 0.55}), 0 0 0 2px rgba(10,12,11,0.8);
    "></span>`,
    iconSize: [active ? 20 : 14, active ? 20 : 14],
    iconAnchor: [active ? 10 : 7, active ? 10 : 7],
  });
}

function FlyToStation({ station }: { station: ChargingStation | null }) {
  const map = useMap();
  useEffect(() => {
    if (station) {
      map.flyTo([station.lat, station.lng], 15, { duration: 0.6 });
    }
  }, [station, map]);
  return null;
}

export function MapView({
  stations,
  selectedStationId,
  onSelectStation,
}: {
  stations: ChargingStation[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
}) {
  const selected = stations.find((s) => s._id === selectedStationId) ?? null;

  return (
    <MapContainer
      center={BOGOTA_CENTER}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#12140f" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        className="evx-map-tiles"
      />
      <FlyToStation station={selected} />
      {stations.map((station) => (
        <Marker
          key={station._id}
          position={[station.lat, station.lng]}
          icon={stationIcon(station._id === selectedStationId)}
          eventHandlers={{ click: () => onSelectStation(station._id) }}
        >
          <Popup>
            <div className="min-w-[180px] font-sans">
              <p className="font-semibold text-ink">{station.name}</p>
              <p className="mt-1 text-xs text-ink/70">{station.address}</p>
              <p className="mt-1 text-xs text-ink/70">{station.hours}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
