"use client";

import { motion } from "motion/react";
import { Logo } from "@/components/ui/Logo";

export function HeroLogoReveal() {
  return (
    <div className="relative">
      <motion.svg
        aria-hidden
        viewBox="0 0 24 44"
        className="pointer-events-none absolute left-1/2 top-[-46px] h-14 w-6 -translate-x-1/2 md:h-16"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.55, duration: 0.35, ease: "easeIn" }}
      >
        <motion.path
          d="M14 0 4 22h6l-3 22 13-26h-7l4-18Z"
          fill="none"
          stroke="var(--color-electric)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.32, ease: "easeIn" }}
          style={{ filter: "drop-shadow(0 0 10px var(--color-electric))" }}
        />
      </motion.svg>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-electric/50 blur-3xl"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.9, 0], scale: [0.7, 1.15, 1] }}
        transition={{ delay: 0.3, duration: 0.55, ease: "easeOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Logo size="lg" />
      </motion.div>
    </div>
  );
}
