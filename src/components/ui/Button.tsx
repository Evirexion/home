import Link from "next/link";
import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ease-in-out transition-all duration-300 active:scale-[0.97]";

const VARIANTS = {
  primary:
    "brand-gradient-bg metal-edge text-ink shadow-[0_4px_24px_rgba(0,255,65,0.22)] hover:scale-[1.03] hover:shadow-[0_6px_32px_rgba(0,255,65,0.38)]",
  outline:
    "border border-silver-300/30 text-silver-100 hover:scale-[1.03] hover:border-electric/50 hover:text-electric hover:shadow-[0_0_20px_rgba(0,255,65,0.14)]",
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
