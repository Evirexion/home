"use client";

import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { ChargingStation } from "@/types/content";
import type { LatLng } from "@/lib/geo";
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

/** The reader's position: a silver dot with an electric ring. */
const userIcon = L.divIcon({
  className: "",
  html: `<span class="evx-user-dot"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/** After "Cerca de mí": frame the reader and their nearest stations together. */
function FlyToUser({
  user,
  nearest,
  request,
}: {
  user: LatLng | null;
  nearest: ChargingStation[];
  request: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!user || request === 0) return;
    const points: [number, number][] = [[user.lat, user.lng], ...nearest.map((s): [number, number] => [s.lat, s.lng])];
    if (points.length === 1) {
      map.flyTo(points[0], 13, { duration: 0.8 });
      return;
    }
    map.flyToBounds(L.latLngBounds(points), { padding: [48, 48], duration: 0.9, maxZoom: 15 });
    // Only when the reader asks to be located, not on every filter change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, map]);
  return null;
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

/** Recenters on the selected city/country whenever that set of stations
 *  changes, independent of the vehicle-type/search filters that only
 *  affect which markers are drawn. */
function FlyToFocus({ stations }: { stations: ChargingStation[] }) {
  const map = useMap();
  useEffect(() => {
    if (stations.length === 0) return;
    if (stations.length === 1) {
      map.flyTo([stations[0].lat, stations[0].lng], 13, { duration: 0.8 });
      return;
    }
    const bounds = L.latLngBounds(stations.map((s): [number, number] => [s.lat, s.lng]));
    map.flyToBounds(bounds, { padding: [32, 32], duration: 0.8, maxZoom: 14 });
  }, [stations, map]);
  return null;
}

export function MapView({
  stations,
  focusStations,
  selectedStationId,
  onSelectStation,
  userLocation = null,
  userAccuracy = 0,
  nearestStations = [],
  locateRequest = 0,
}: {
  stations: ChargingStation[];
  focusStations: ChargingStation[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  userLocation?: LatLng | null;
  /** Accuracy radius of the browser's fix, in metres. */
  userAccuracy?: number;
  nearestStations?: ChargingStation[];
  /** Increments each time the reader is located, to re-frame the map. */
  locateRequest?: number;
}) {
  const selected = stations.find((s) => s._id === selectedStationId) ?? null;

  return (
    <MapContainer
      center={BOGOTA_CENTER}
      zoom={12}
      minZoom={4}
      maxZoom={18}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#12140f" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        // OpenStreetMap needs no API key (CARTO's dark tiles started returning
        // "API KEY REQUIRED"); the dark look comes from .evx-map-tiles in globals.css.
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
        maxNativeZoom={19}
        className="evx-map-tiles"
      />
      <FlyToFocus stations={focusStations} />
      {/* After FlyToFocus so that, on the render where the reader is located, this framing wins. */}
      <FlyToUser user={userLocation} nearest={nearestStations} request={locateRequest} />
      <FlyToStation station={selected} />
      {userLocation && (
        <>
          {userAccuracy > 30 && userAccuracy < 5000 && (
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userAccuracy}
              pathOptions={{ color: "#c9d1ce", weight: 1, opacity: 0.4, fillColor: "#c9d1ce", fillOpacity: 0.06 }}
            />
          )}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={1000}>
            <Popup>
              <p className="font-sans text-xs font-semibold text-ink">Estás aquí (aproximado)</p>
            </Popup>
          </Marker>
        </>
      )}
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
              {station.pricing && <p className="mt-1 text-xs font-medium text-ink/70">{station.pricing}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
