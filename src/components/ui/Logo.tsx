import clsx from "clsx";
import { LightningBolt } from "@/components/icons/LightningBolt";

const SIZES = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl md:text-7xl",
} as const;

const CHROME_GRADIENT =
  "linear-gradient(180deg, #f7f9f8 0%, #ffffff 13%, #d3d9d7 28%, #808a87 44%, #a6afac 56%, #f2f5f4 70%, #b7bdba 85%, #f4f6f5 100%)";

const SHINE_GRADIENT =
  "linear-gradient(112deg, transparent 25%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.95) 48%, rgba(255,255,255,0.05) 56%, transparent 70%)";

function ChromeText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span aria-hidden className="bg-clip-text text-transparent" style={{ backgroundImage: CHROME_GRADIENT }}>
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 bg-clip-text text-transparent bg-[length:260%_100%] animate-logo-shine mix-blend-overlay"
        style={{ backgroundImage: SHINE_GRADIENT }}
      >
        {children}
      </span>
      <span className="sr-only">{children}</span>
    </span>
  );
}

/**
 * CSS/SVG approximation of the real chrome/metallic E-VIREXION wordmark.
 * Swap for the real brand SVG/PNG by dropping files into /public/brand and
 * replacing this component's markup.
 */
export function Logo({ size = "md", className }: { size?: keyof typeof SIZES; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-display font-bold uppercase tracking-tight leading-none",
        "[text-shadow:0_1px_0_rgba(255,255,255,0.3),0_2px_3px_rgba(0,0,0,0.4),0_8px_18px_rgba(0,0,0,0.5)]",
        SIZES[size],
        className
      )}
    >
      <ChromeText>E-VIREXI</ChromeText>
      <span className="relative inline-grid place-items-center">
        <ChromeText>O</ChromeText>
        <LightningBolt className="absolute h-[0.46em] w-[0.46em] text-electric drop-shadow-[0_0_10px_var(--color-electric)]" />
      </span>
      <ChromeText>N</ChromeText>
    </span>
  );
}
