import clsx from "clsx";

export function Badge({
  children,
  variant = "outline",
  className,
}: {
  children: React.ReactNode;
  variant?: "outline" | "solid";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase",
        variant === "outline" && "border border-electric/40 text-electric",
        variant === "solid" && "bg-electric text-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
