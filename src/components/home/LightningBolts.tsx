"use client";

import { useEffect, useRef, type RefObject } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";

function midDisplace(x1: number, y1: number, x2: number, y2: number, disp: number, pts: [number, number][]) {
  if (disp < 2.4) {
    pts.push([x2, y2]);
    return;
  }
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * disp;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * disp;
  midDisplace(x1, y1, mx, my, disp / 1.85, pts);
  midDisplace(mx, my, x2, y2, disp / 1.85, pts);
}

function boltPath(x1: number, y1: number, x2: number, y2: number, disp: number) {
  const pts: [number, number][] = [[x1, y1]];
  midDisplace(x1, y1, x2, y2, disp, pts);
  return "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
}

function makePath(d: string, stroke: string, width: number, opacity: number) {
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("d", d);
  p.setAttribute("stroke", stroke);
  p.setAttribute("stroke-width", String(width));
  p.setAttribute("opacity", String(opacity));
  p.setAttribute("fill", "none");
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  return p;
}

/** Layered stroke: wide soft halo, medium halo, gradient core, thin bright fillet. */
function boltGroup(d: string, scale: number) {
  const g = document.createElementNS(SVG_NS, "g");
  g.appendChild(makePath(d, "rgba(29,158,117,.5)", 11 * scale, 0.45));
  g.appendChild(makePath(d, "rgba(79,255,176,.6)", 6 * scale, 0.6));
  g.appendChild(makePath(d, "url(#evx-bolt-grad)", 3.4 * scale, 0.95));
  g.appendChild(makePath(d, "var(--color-mint-light)", 1.2 * scale, 0.85));
  return g;
}

function flicker(g: SVGGElement) {
  let life = 0;
  const step = () => {
    life++;
    g.style.opacity = Math.random() > 0.3 ? "1" : "0.12";
    if (life < 6 + Math.floor(Math.random() * 4)) {
      setTimeout(step, 24 + Math.random() * 42);
    } else {
      g.style.transition = "opacity .13s";
      g.style.opacity = "0";
      setTimeout(() => g.remove(), 150);
    }
  };
  step();
}

interface Box {
  cx: number;
  cy: number;
  w: number;
  h: number;
  l: number;
  t: number;
  rr: number;
  b: number;
}

/**
 * Ambient lightning ported from the production evirexion.com teaser page:
 * bolts continuously radiate from and strike toward the logo at irregular
 * intervals, with randomized paths, lengths, and a short flicker-out.
 * Scoped to `containerRef` instead of the full viewport.
 */
export function LightningBolts<T extends HTMLElement>({
  containerRef,
  targetRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  targetRef: RefObject<T | null>;
}) {
  const backLayerRef = useRef<SVGGElement>(null);
  const frontLayerRef = useRef<SVGGElement>(null);
  const crackleLayerRef = useRef<SVGGElement>(null);
  const svgBackRef = useRef<SVGSVGElement>(null);
  const svgFrontRef = useRef<SVGSVGElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;

    function size() {
      const rect = container!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      svgBackRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svgFrontRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(container);

    function targetBox(): Box {
      const c = container!.getBoundingClientRect();
      const r = target!.getBoundingClientRect();
      return {
        cx: r.left - c.left + r.width / 2,
        cy: r.top - c.top + r.height / 2,
        w: r.width,
        h: r.height,
        l: r.left - c.left,
        t: r.top - c.top,
        rr: r.right - c.left,
        b: r.bottom - c.top,
      };
    }

    function pulse() {
      target!.classList.remove("animate-evx-zap");
      void (target as HTMLElement).offsetWidth;
      target!.classList.add("animate-evx-zap");
      const flashEl = flashRef.current;
      if (flashEl) {
        flashEl.classList.remove("animate-evx-flash");
        void flashEl.offsetWidth;
        flashEl.classList.add("animate-evx-flash");
      }
    }

    function radiate() {
      const B = targetBox();
      const ang = Math.random() * Math.PI * 2;
      const rx = B.w * 0.42;
      const ry = B.h * 0.5;
      const ox = B.cx + Math.cos(ang) * rx;
      const oy = B.cy + Math.sin(ang) * ry;
      const reach = Math.max(width, height) * 0.75;
      const tx = B.cx + Math.cos(ang) * (rx + reach);
      const ty = B.cy + Math.sin(ang) * (ry + reach);
      const g = boltGroup(boltPath(ox, oy, tx, ty, 130), 1.35);
      backLayerRef.current?.appendChild(g);
      flicker(g);
      pulse();
    }

    function radiateBurst(k: number) {
      const B = targetBox();
      const base = Math.random() * Math.PI * 2;
      const rx = B.w * 0.42;
      const ry = B.h * 0.5;
      const reach = Math.max(width, height) * 0.8;
      for (let i = 0; i < k; i++) {
        const ang = base + i * ((Math.PI * 2) / k) + (Math.random() - 0.5) * 0.5;
        const ox = B.cx + Math.cos(ang) * rx;
        const oy = B.cy + Math.sin(ang) * ry;
        const tx = B.cx + Math.cos(ang) * (rx + reach);
        const ty = B.cy + Math.sin(ang) * (ry + reach);
        const g = boltGroup(boltPath(ox, oy, tx, ty, 130), 1.5);
        backLayerRef.current?.appendChild(g);
        flicker(g);
      }
      pulse();
    }

    function strike() {
      const B = targetBox();
      const e = Math.random();
      let x1: number;
      let y1: number;
      if (e < 0.5) {
        x1 = Math.random() * width;
        y1 = -20;
      } else if (e < 0.75) {
        x1 = -20;
        y1 = Math.random() * height * 0.7;
      } else {
        x1 = width + 20;
        y1 = Math.random() * height * 0.7;
      }
      const x2 = B.l + Math.random() * B.w;
      const y2 = B.t + B.h * (0.2 + Math.random() * 0.6);
      const g = boltGroup(boltPath(x1, y1, x2, y2, 110), 1.2);
      frontLayerRef.current?.appendChild(g);
      flicker(g);
      pulse();
    }

    let crackleTimeout: ReturnType<typeof setTimeout>;
    function crackle() {
      const layer = crackleLayerRef.current;
      if (reduce || !layer) return;
      layer.innerHTML = "";
      const B = targetBox();
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const side = Math.random();
        let x: number;
        let y: number;
        if (side < 0.4) {
          x = B.l + Math.random() * B.w;
          y = (Math.random() < 0.5 ? B.t : B.b) + (Math.random() - 0.5) * 10;
        } else {
          x = (Math.random() < 0.5 ? B.l : B.rr) + (Math.random() - 0.5) * 10;
          y = B.t + Math.random() * B.h;
        }
        const len = 20 + Math.random() * 48;
        const a = Math.random() * Math.PI * 2;
        const d = boltPath(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, 18);
        layer.appendChild(makePath(d, "url(#evx-bolt-grad)", 1.5, 0.45 + Math.random() * 0.5));
      }
      crackleTimeout = setTimeout(crackle, 80 + Math.random() * 120);
    }

    let loopTimeout: ReturnType<typeof setTimeout>;
    function loop() {
      if (!reduce) {
        radiate();
        if (Math.random() < 0.7) setTimeout(radiate, 50);
        if (Math.random() < 0.5) setTimeout(strike, 120);
        if (Math.random() < 0.32) setTimeout(() => radiateBurst(3 + Math.floor(Math.random() * 3)), 90);
      }
      loopTimeout = setTimeout(loop, reduce ? 4000 : 260 + Math.random() * 620);
    }

    crackle();
    loop();

    return () => {
      ro.disconnect();
      clearTimeout(crackleTimeout);
      clearTimeout(loopTimeout);
    };
  }, [containerRef, targetRef]);

  return (
    <>
      <svg
        ref={svgBackRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full [mask-image:linear-gradient(to_bottom,#000_58%,transparent_88%)]"
      >
        <defs>
          <linearGradient id="evx-bolt-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bafff0" />
            <stop offset="42%" stopColor="var(--color-mint)" />
            <stop offset="100%" stopColor="var(--color-teal)" />
          </linearGradient>
          <filter id="evx-bolt-blur-back" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g ref={backLayerRef} filter="url(#evx-bolt-blur-back)" />
      </svg>

      <svg ref={svgFrontRef} aria-hidden className="pointer-events-none absolute inset-0 z-[3] h-full w-full">
        <defs>
          <filter id="evx-bolt-blur-front" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g ref={frontLayerRef} filter="url(#evx-bolt-blur-front)" />
        <g ref={crackleLayerRef} filter="url(#evx-bolt-blur-front)" />
      </svg>

      <div
        ref={flashRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] opacity-0 [mix-blend-mode:screen]"
        style={{ background: "radial-gradient(60% 50% at 50% 42%, rgba(79,255,176,.16), transparent 70%)" }}
      />
    </>
  );
}
