"use client";

import { useRef } from "react";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { LightningBolts } from "./LightningBolts";

export function HeroStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <LightningBolts containerRef={containerRef} targetRef={logoRef} />

      <div className="absolute left-1/2 top-1/2 z-[2] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="animate-hero-breathe absolute left-1/2 top-1/2 h-[120%] w-[66%] -translate-x-1/2 -translate-y-1/2 blur-[18px]"
            style={{ background: "radial-gradient(closest-side, rgba(29,158,117,.5), rgba(29,158,117,0) 72%)" }}
          />
          <Logo ref={logoRef} size="lg" className="relative drop-shadow-[0_0_26px_rgba(29,158,117,0.5)]" />
        </div>
        <Image
          src="/brand/logo-tagline.png"
          alt="Driving the electric shift"
          width={1071}
          height={113}
          className="relative mt-5 h-auto w-[280px] md:w-[340px]"
        />
      </div>
    </div>
  );
}
