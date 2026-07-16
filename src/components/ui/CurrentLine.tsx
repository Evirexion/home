export function CurrentLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 32"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d="M0 16 L150 16 L165 3 L178 29 L191 3 L204 29 L217 16 L400 16"
        fill="none"
        stroke="var(--color-silver-700)"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
      <path
        d="M0 16 L150 16 L165 3 L178 29 L191 3 L204 29 L217 16 L400 16"
        fill="none"
        stroke="var(--color-electric)"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="animate-current-flow"
        style={{ filter: "drop-shadow(0 0 6px var(--color-electric))" }}
      />
    </svg>
  );
}
