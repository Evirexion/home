/** Deterministic pseudo-random in [0, 1), seeded so server and client render identically (no hydration mismatch, no client JS needed). */
function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function Sparks({ count = 28 }: { count?: number }) {
  const sparks = Array.from({ length: count }, (_, id) => ({
    id,
    left: seeded(id * 12.9898) * 100,
    duration: 6 + seeded(id * 78.233) * 9,
    delay: seeded(id * 37.719) * 9,
    dx: (seeded(id * 4.238) - 0.5) * 60,
  }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="animate-spark-rise absolute h-[3px] w-[3px] rounded-full opacity-0"
          style={
            {
              left: `${s.left}%`,
              top: "100%",
              background: "var(--color-mint)",
              boxShadow: "0 0 6px var(--color-mint), 0 0 12px var(--color-teal)",
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              "--dx": `${s.dx}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
