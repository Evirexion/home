import Image from "next/image";
import clsx from "clsx";
import { forwardRef } from "react";

const WORDMARK_RATIO = 1078 / 189;

const WIDTHS = {
  sm: 132,
  md: 200,
  lg: 620,
} as const;

/**
 * Real E-VIREXION chrome wordmark, extracted from the production asset at
 * evirexion.com (src/public/brand/logo-wordmark.png). Swap the file directly
 * if a higher-resolution or vector version becomes available.
 */
export const Logo = forwardRef<HTMLImageElement, { size?: keyof typeof WIDTHS; className?: string }>(
  function Logo({ size = "md", className }, ref) {
    const width = WIDTHS[size];
    const height = Math.round(width / WORDMARK_RATIO);
    return (
      <Image
        ref={ref}
        src="/brand/logo-wordmark.png"
        alt="E-VIREXION"
        width={1078}
        height={189}
        priority={size === "lg"}
        className={clsx("h-auto w-auto", className)}
        style={{ width, height }}
      />
    );
  }
);
