import Link from "next/link";
import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.97]";

const VARIANTS = {
  primary:
    "bg-electric text-ink shadow-[0_0_22px_rgba(0,255,65,0.35)] hover:scale-[1.035] hover:shadow-[0_0_44px_rgba(0,255,65,0.65)]",
  outline:
    "border border-silver-500/40 text-silver-100 hover:scale-[1.035] hover:border-electric/60 hover:text-electric hover:shadow-[0_0_28px_rgba(0,255,65,0.2)]",
  ghost: "text-silver-300 hover:text-electric",
} as const;

type Variant = keyof typeof VARIANTS;

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} className={clsx(BASE, VARIANTS[variant], className)} {...props}>
      {children}
    </Link>
  );
}
