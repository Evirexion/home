"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Loader2, Navigation } from "lucide-react";
import { distanceKm, formatDistance, type LatLng } from "@/lib/geo";
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

/** Picks the value with the most stations (ties broken alphabetically) so
 *  the default view lands on the best-covered country/city rather than
 *  whichever sorts first alphabetically. */
function mostCommon(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "";
}

type GeoStatus = "idle" | "locating" | "located" | "denied" | "error" | "unsupported";

const GEO_MESSAGES: Partial<Record<GeoStatus, string>> = {
  denied: "No tenemos permiso para ver tu ubicación. Actívalo en el candado junto a la dirección del navegador y vuelve a intentar.",
  error: "No pudimos obtener tu ubicación. Revisa que el GPS o la ubicación del equipo estén activos e intenta de nuevo.",
  unsupported: "Tu navegador no permite compartir la ubicación. Elige país y ciudad en los selectores.",
};

/** Beyond this, "near you" isn't honest: say how far the closest one really is. */
const FAR_KM = 60;

export function MapExplorer({ stations }: { stations: ChargingStation[] }) {
  const countries = useMemo(() => Array.from(new Set(stations.map((s) => s.country))).sort(), [stations]);
  const [country, setCountry] = useState(() => mostCommon(stations.map((s) => s.country)));

  const cities = useMemo(
    () =>
      Array.from(new Set(stations.filter((s) => s.country === country).map((s) => s.city))).sort(),
    [stations, country]
  );
  const [city, setCity] = useState(() => mostCommon(stations.filter((s) => s.country === country).map((s) => s.city)));

  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<VehicleType[]>(VEHICLE_TYPES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reader's position. Used only here in the browser: never sent to our
  // servers, never stored, never passed to analytics.
  const [user, setUser] = useState<(LatLng & { accuracy: number }) | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [locateRequest, setLocateRequest] = useState(0);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here = { lat: position.coords.latitude, lng: position.coords.longitude };
        let nearest: ChargingStation | null = null;
        let best = Infinity;
        for (const station of stations) {
          const d = distanceKm(here, station);
          if (d < best) {
            best = d;
            nearest = station;
          }
        }
        // Jump the selectors to where the reader actually is.
        if (nearest) {
          setCountry(nearest.country);
          setCity(nearest.city);
        }
        setSelectedId(null);
        setUser({ ...here, accuracy: position.coords.accuracy });
        setGeoStatus("located");
        setLocateRequest((n) => n + 1);
      },
      (error) => setGeoStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 5 * 60 * 1000 }
    );
  }, [stations]);

  // If the reader already allowed location on a previous visit, locate them
  // straight away; otherwise wait for them to press the button (no surprise prompt).
  useEffect(() => {
    let cancelled = false;
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((status) => {
        if (!cancelled && status.state === "granted") locate();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locate]);

  const distances = useMemo(() => {
    if (!user) return null;
    return new Map(stations.map((s) => [s._id, distanceKm(user, s)]));
  }, [stations, user]);

  /** Closest stations anywhere (not just the selected city) that fit the vehicle filter. */
  const nearby = useMemo(() => {
    if (!distances) return [];
    return stations
      .filter((s) => s.vehicleTypes.some((t) => activeTypes.includes(t)))
      .sort((a, b) => distances.get(a._id)! - distances.get(b._id)!)
      .slice(0, 3);
  }, [stations, distances, activeTypes]);
  const closestKm = nearby[0] ? distances!.get(nearby[0]._id)! : null;

  function selectStation(station: ChargingStation) {
    if (station.country !== country) setCountry(station.country);
    if (station.city !== city) setCity(station.city);
    setSelectedId(station._id);
  }

  function handleCountryChange(value: string) {
    setCountry(value);
    setCity(mostCommon(stations.filter((s) => s.country === value).map((s) => s.city)));
    setSelectedId(null);
  }

  function handleCityChange(value: string) {
    setCity(value);
    setSelectedId(null);
  }

  function toggleType(type: VehicleType) {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  // Stations in the selected city, before the vehicle-type/search filters
  // narrow them further. Drives map recentering so the view still jumps to
  // the right city even if the current vehicle-type filter would hide
  // every marker there.
  const cityStations = useMemo(
    () => stations.filter((s) => s.country === country && s.city === city),
    [stations, country, city]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = cityStations.filter((station) => {
      const matchesType = station.vehicleTypes.some((t) => activeTypes.includes(t));
      const matchesQuery =
        !q || station.name.toLowerCase().includes(q) || station.zone.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
    // Once we know where the reader is, closest first.
    if (distances) matches.sort((a, b) => distances.get(a._id)! - distances.get(b._id)!);
    return matches;
  }, [cityStations, query, activeTypes, distances]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <LocationSelector
          countries={countries}
          cities={cities}
          country={country}
          city={city}
          onCountryChange={handleCountryChange}
          onCityChange={handleCityChange}
        />
        <button
          type="button"
          onClick={locate}
          disabled={geoStatus === "locating"}
          className="flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-5 py-2.5 text-sm font-semibold text-electric transition-colors ease-in-out hover:bg-electric/20 disabled:opacity-60"
        >
          {geoStatus === "locating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
          {geoStatus === "locating" ? "Buscando tu ubicación…" : user ? "Actualizar mi ubicación" : "Cerca de mí"}
        </button>
      </div>

      {GEO_MESSAGES[geoStatus] && (
        <p role="status" className="rounded-2xl border border-silver-300/15 bg-ink-raised px-5 py-3 text-sm text-silver-300">
          {GEO_MESSAGES[geoStatus]}
        </p>
      )}

      {user && nearby.length > 0 && (
        <section
          aria-label="Estaciones más cercanas a ti"
          className="metal-edge rounded-2xl border border-electric/25 bg-ink-raised p-5 shadow-[0_0_32px_rgba(0,255,65,0.08)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-silver-100">
              <Navigation className="h-4 w-4 text-electric" />
              Cerca de ti
            </h2>
            <p className="text-xs text-silver-700">
              Distancia en línea recta · tu ubicación no sale de tu dispositivo
            </p>
          </div>
          {closestKm !== null && closestKm > FAR_KM && (
            <p className="mt-2 text-sm text-silver-500">
              Aún no tenemos estaciones verificadas en tu zona: la más cercana está a {formatDistance(closestKm)}.
            </p>
          )}
          <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {nearby.map((station, index) => (
              <li key={station._id}>
                <button
                  type="button"
                  onClick={() => selectStation(station)}
                  className="flex h-full w-full flex-col gap-1 rounded-xl border border-silver-300/15 bg-ink/60 p-4 text-left transition-colors ease-in-out hover:border-electric/40"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric">
                    {index === 0 ? "La más cercana" : `#${index + 1}`} · a {formatDistance(distances!.get(station._id)!)}
                  </span>
                  <span className="font-semibold text-silver-100">{station.name}</span>
                  <span className="text-xs text-silver-500">
                    {station.zone} · {station.city}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

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
              distanceKm={distances?.get(station._id)}
            />
          ))}
        </div>

        <div className="metal-edge h-[420px] overflow-hidden rounded-2xl border border-silver-300/15 lg:h-[640px]">
          <MapView
            stations={filtered}
            focusStations={cityStations}
            selectedStationId={selectedId}
            onSelectStation={setSelectedId}
            userLocation={user}
            userAccuracy={user?.accuracy ?? 0}
            nearestStations={nearby}
            locateRequest={locateRequest}
          />
        </div>
      </div>

      <p className="text-xs text-silver-700">
        Datos de estaciones:{" "}
        <a
          href="https://openchargemap.org"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-silver-700/40 underline-offset-2 transition-colors hover:text-electric"
        >
          Open Charge Map
        </a>
      </p>
    </div>
  );
}
