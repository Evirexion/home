"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface PageFlipInstance {
  loadFromHTML(items: HTMLElement[]): void;
  flipNext(): void;
  flipPrev(): void;
  flip(page: number): void;
  getCurrentPageIndex(): number;
  getPageCount(): number;
  on(event: "flip" | "init" | "changeOrientation", callback: (e: { data: unknown }) => void): void;
  update(): void;
  destroy(): void;
}

interface Props {
  slug: string;
  totalPages: number;
  previewPages: number;
  canReadAll: boolean;
  width: number;
  height: number;
}

/** Builds the call-to-action page shown after the free preview. Plain DOM: page-flip owns these nodes. */
function lockedPage(totalPages: number, previewPages: number): HTMLElement {
  const page = document.createElement("div");
  page.className = "evx-page evx-page--locked";
  page.innerHTML = `
    <div class="evx-locked">
      <p class="evx-locked__eyebrow">Sigue leyendo</p>
      <p class="evx-locked__title">Te quedan ${totalPages - previewPages} páginas de esta edición</p>
      <p class="evx-locked__text">Crea tu cuenta gratis para leer la revista completa: Corriente, pioneros y la guía de precios de todos los eléctricos de Colombia.</p>
      <a class="evx-locked__cta" href="/cuenta/registro">Crear cuenta gratis</a>
      <a class="evx-locked__link" href="/cuenta/ingresar?next=${encodeURIComponent(window.location.pathname)}">Ya tengo cuenta · Ingresar</a>
    </div>`;
  return page;
}

function imagePage(src: string, number: number, eager: boolean): HTMLElement {
  const page = document.createElement("div");
  page.className = "evx-page";
  const img = document.createElement("img");
  img.src = src;
  img.alt = `Página ${number}`;
  img.loading = eager ? "eager" : "lazy";
  img.decoding = "async";
  img.draggable = false;
  page.appendChild(img);
  return page;
}

export function MagazineReader({ slug, totalPages, previewPages, canReadAll, width, height }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlipInstance | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const visiblePages = canReadAll ? totalPages : previewPages;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    // page-flip removes its root element on destroy, so give it one React doesn't own.
    const book = document.createElement("div");
    host.appendChild(book);

    (async () => {
      const { PageFlip } = (await import("page-flip")) as unknown as {
        PageFlip: new (el: HTMLElement, settings: Record<string, unknown>) => PageFlipInstance;
      };
      if (cancelled) return;
      const pages: HTMLElement[] = [];
      for (let n = 1; n <= visiblePages; n += 1) {
        pages.push(imagePage(`/api/revista/${slug}/${n}`, n, n <= 3));
      }
      if (!canReadAll) pages.push(lockedPage(totalPages, previewPages));

      const flip = new PageFlip(book, {
        width: Math.round(width / 2),
        height: Math.round(height / 2),
        size: "stretch",
        minWidth: 260,
        maxWidth: 900,
        minHeight: 368,
        maxHeight: 1273,
        showCover: true,
        usePortrait: true,
        mobileScrollSupport: true,
        maxShadowOpacity: 0.45,
        flippingTime: 700,
        clickEventForward: true,
      });
      flip.loadFromHTML(pages);
      flip.on("flip", (e) => setCurrent(Number(e.data)));
      flipRef.current = flip;
      setCount(flip.getPageCount());
      setCurrent(flip.getCurrentPageIndex());
    })();

    return () => {
      cancelled = true;
      flipRef.current?.destroy();
      flipRef.current = null;
      book.remove();
    };
  }, [slug, visiblePages, canReadAll, totalPages, previewPages, width, height]);

  const next = useCallback(() => flipRef.current?.flipNext(), []);
  const prev = useCallback(() => flipRef.current?.flipPrev(), []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    function onChange() {
      setFullscreen(Boolean(document.fullscreenElement));
      setTimeout(() => flipRef.current?.update(), 50);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen?.();
  }

  const label =
    count === 0
      ? "Cargando…"
      : !canReadAll && current >= visiblePages
        ? "Vista previa"
        : `Página ${Math.min(current + 1, visiblePages)} de ${totalPages}`;

  const control =
    "flex h-11 w-11 items-center justify-center rounded-full border border-silver-300/20 bg-ink/80 text-silver-100 transition-colors hover:border-electric/50 hover:text-electric disabled:opacity-30";

  return (
    <div
      ref={frameRef}
      className={fullscreen ? "flex h-full flex-col justify-center bg-ink p-4" : "flex flex-col"}
    >
      {/* Two pages side by side must fit the viewport height (minus header and controls). */}
      <div
        ref={hostRef}
        className="evx-book mx-auto w-full"
        style={{
          maxWidth: fullscreen
            ? `calc((100vh - 120px) * ${(2 * width) / height})`
            : `min(72rem, calc((100vh - 340px) * ${(2 * width) / height}))`,
        }}
      />
      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={prev} disabled={current === 0} className={control} aria-label="Página anterior">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="min-w-40 text-center font-mono text-xs uppercase tracking-[0.2em] text-silver-500" aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          onClick={next}
          disabled={count > 0 && current >= count - 1}
          className={control}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button type="button" onClick={toggleFullscreen} className={control} aria-label="Pantalla completa">
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-silver-700">
        Arrastra la esquina de la página, usa las flechas o el teclado para pasar las hojas.
      </p>
    </div>
  );
}
