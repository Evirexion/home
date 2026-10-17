"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

/** "33889" -> "33.889", identical on server and client (no ICU differences). */
function format(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Renders the real number from the start (so it's never stuck at 0 if the
 * animation doesn't run) and counts up from 0 the first time it scrolls into view.
 */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = `${format(latest)}${suffix}`;
      },
    });
    return () => {
      controls.stop();
      node.textContent = `${format(value)}${suffix}`;
    };
  }, [inView, value, suffix]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
      {suffix}
    </span>
  );
}
