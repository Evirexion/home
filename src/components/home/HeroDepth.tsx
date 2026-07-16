/**
 * Gives the hero's black backdrop actual depth instead of a flat void:
 * a faint charcoal lift behind the logo, and a soft glow rising from
 * beneath the grid floor, like the scene is lit from below.
 */
export function HeroDepth() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute left-1/2 top-[38%] h-[70%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{ background: "radial-gradient(closest-side, rgba(220,226,224,0.05), transparent 72%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: "radial-gradient(60% 100% at 50% 100%, rgba(79,255,176,0.13), transparent 72%)" }}
      />
    </div>
  );
}
