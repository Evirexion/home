"use client";

import { useSyncExternalStore } from "react";
import clsx from "clsx";
import { CalendarClock } from "lucide-react";
import { RELEASE_DAY } from "@/data/editions";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Today's date in Bogotá, whatever the visitor's own time zone. */
function todayInBogota(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month") - 1, day: get("day") };
}

function nextRelease({ year, month, day }: { year: number; month: number; day: number }) {
  if (day === RELEASE_DAY) return { today: true, label: "", days: 0 };
  const nextMonth = day < RELEASE_DAY ? month : (month + 1) % 12;
  const nextYear = day < RELEASE_DAY || month < 11 ? year : year + 1;
  const days = Math.round(
    (Date.UTC(nextYear, nextMonth, RELEASE_DAY) - Date.UTC(year, month, day)) / 86_400_000
  );
  return { today: false, label: `${RELEASE_DAY} de ${MONTHS[nextMonth]}`, days };
}

const noopSubscribe = () => () => {};

/**
 * "Nueva edición el 17 de cada mes" with a live countdown to the next one.
 * The countdown is filled in on the client so a cached page never shows a
 * stale date.
 */
export function NextEditionBadge({ className }: { className?: string }) {
  // Server render has no date (null); the browser fills it in on hydration.
  const todayKey = useSyncExternalStore(
    noopSubscribe,
    () => {
      const { year, month, day } = todayInBogota();
      return `${year}-${month}-${day}`;
    },
    () => null
  );
  const next = todayKey
    ? (() => {
        const [year, month, day] = todayKey.split("-").map(Number);
        return nextRelease({ year, month, day });
      })()
    : null;

  return (
    <div
      className={clsx(
        "inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-electric/30 bg-electric/[0.06] px-4 py-2 text-sm text-silver-100",
        className
      )}
    >
      <CalendarClock className="h-4 w-4 shrink-0 text-electric" />
      <span>
        Nueva edición el <strong className="font-semibold text-electric">{RELEASE_DAY} de cada mes</strong>
      </span>
      {next && (
        <>
          <span aria-hidden className="h-1 w-1 rounded-full bg-electric/60" />
          <span className="text-silver-300">
            {next.today
              ? "¡Hoy sale edición nueva!"
              : `Próxima: ${next.label} · ${next.days === 1 ? "mañana" : `en ${next.days} días`}`}
          </span>
        </>
      )}
    </div>
  );
}
