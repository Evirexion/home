"use client";

import { useState } from "react";
import clsx from "clsx";
import { Calculator } from "./Calculator";
import { PriceBrowser } from "./PriceBrowser";
import type { VehicleListing } from "@/types/content";

const TABS = [
  { id: "calculator", label: "Calculadora" },
  { id: "browse", label: "Explorar precios" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function PricesExplorer({ listings }: { listings: VehicleListing[] }) {
  const [tab, setTab] = useState<Tab>("calculator");

  return (
    <div className="flex flex-col gap-8">
      <div className="inline-flex w-fit gap-1 rounded-full border border-silver-300/15 bg-ink-raised p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-medium ease-in-out transition-all duration-300",
              tab === t.id ? "brand-gradient-bg text-ink" : "text-silver-300 hover:text-electric"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "calculator" ? <Calculator listings={listings} /> : <PriceBrowser listings={listings} />}
    </div>
  );
}
