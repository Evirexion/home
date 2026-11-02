"use client";

import { useSyncExternalStore } from "react";
import clsx from "clsx";
import { FONT_DEFAULT_INDEX, FONT_STEPS, FONT_STORAGE_KEY } from "@/lib/fontSize";

/**
 * Lets readers make the whole site's text bigger or smaller. Every size on the
 * site is in rem, so changing the root font-size scales everything together.
 * The choice is remembered in this browser only (nothing is sent anywhere).
 */
const EVENT = "evx-font-change";
let memoryIndex = FONT_DEFAULT_INDEX; // fallback when storage is unavailable

function read(): number {
  try {
    const saved = Number.parseInt(localStorage.getItem(FONT_STORAGE_KEY) ?? "", 10);
    if (saved >= 0 && saved < FONT_STEPS.length) return saved;
  } catch {
    /* ignore */
  }
  return memoryIndex;
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function apply(index: number) {
  memoryIndex = index;
  document.documentElement.style.fontSize = index === FONT_DEFAULT_INDEX ? "" : `${FONT_STEPS[index]}%`;
  try {
    localStorage.setItem(FONT_STORAGE_KEY, String(index));
  } catch {
    /* private mode etc. — size still applies for this visit */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function FontSizeControl({ className }: { className?: string }) {
  const index = useSyncExternalStore(subscribe, read, () => FONT_DEFAULT_INDEX);

  function change(next: number) {
    const clamped = Math.min(FONT_STEPS.length - 1, Math.max(0, next));
    apply(clamped);
  }

  const btn =
    "flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-semibold text-silver-300 transition-colors hover:bg-white/5 hover:text-electric disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-silver-300";

  return (
    <div
      role="group"
      aria-label="Tamaño de la letra"
      className={clsx("flex items-center rounded-full border border-silver-300/20", className)}
    >
      <button
        type="button"
        onClick={() => change(index - 1)}
        disabled={index === 0}
        aria-label="Letra más pequeña"
        title="Letra más pequeña"
        className={clsx(btn, "text-xs")}
      >
        A−
      </button>
      <button
        type="button"
        onClick={() => change(FONT_DEFAULT_INDEX)}
        aria-label={`Tamaño de letra normal (ahora ${FONT_STEPS[index]} %)`}
        title="Tamaño normal"
        className={clsx(btn, "text-sm", index !== FONT_DEFAULT_INDEX && "text-electric")}
      >
        A
      </button>
      <button
        type="button"
        onClick={() => change(index + 1)}
        disabled={index === FONT_STEPS.length - 1}
        aria-label="Letra más grande"
        title="Letra más grande"
        className={clsx(btn, "text-base")}
      >
        A+
      </button>
    </div>
  );
}
