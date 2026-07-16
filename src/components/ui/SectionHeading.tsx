import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={clsx(align === "center" && "text-center", className)}>
      {eyebrow && (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-teal">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-bold text-silver-100 md:text-4xl">{title}</h2>
      {description && <p className="mt-3 max-w-2xl text-silver-500 [text-wrap:balance]">{description}</p>}
    </div>
  );
}
