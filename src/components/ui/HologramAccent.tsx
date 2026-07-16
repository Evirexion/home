import clsx from "clsx";

/**
 * Small iridescent accent (yellow/blue/red hologram sheen, echoing the
 * Colombian flag without depicting it literally) used as a brand signature
 * in the footer and hero.
 */
export function HologramAccent({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx("inline-block animate-hologram-shift rounded-full", className)}
      style={{
        backgroundImage:
          "linear-gradient(115deg, #ffd23f 0%, #4fffb0 22%, #3d8bff 45%, #ff3d54 68%, #ffd23f 100%)",
        filter: "saturate(1.1) brightness(1.05)",
      }}
    />
  );
}
