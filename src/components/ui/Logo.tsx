import clsx from "clsx";
import { LightningBolt } from "@/components/icons/LightningBolt";

const SIZES = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl md:text-7xl",
} as const;

/**
 * Placeholder wordmark approximating the E-VIREXION chrome/metallic
 * treatment in CSS. Swap for the real brand SVG/PNG by dropping files into
 * /public/brand and replacing this component's markup.
 */
export function Logo({ size = "md", className }: { size?: keyof typeof SIZES; className?: string }) {
  const metallic =
    "bg-gradient-to-b from-silver-100 via-silver-300 to-silver-700 bg-clip-text text-transparent";

  return (
    <span
      className={clsx(
        "inline-flex items-center font-display font-bold uppercase tracking-tight leading-none",
        SIZES[size],
        className
      )}
    >
      <span className={metallic}>E-VIREXI</span>
      <span className="relative inline-grid place-items-center">
        <span className={metallic}>O</span>
        <LightningBolt className="absolute h-[0.48em] w-[0.48em] text-electric drop-shadow-[0_0_8px_var(--color-electric)]" />
      </span>
      <span className={metallic}>N</span>
    </span>
  );
}
