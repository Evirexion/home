import { Container } from "@/components/ui/Container";

/** Shared frame for the account pages: brand copy on one side, the form on the other. */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-16 md:py-24">
      <Container className="grid items-start gap-10 md:grid-cols-12">
        <div className="md:col-span-5 md:pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-electric">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-silver-100 md:text-5xl">{title}</h1>
          {description && <p className="mt-5 max-w-md leading-relaxed text-silver-300">{description}</p>}
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <div className="metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-6 md:p-8">{children}</div>
        </div>
      </Container>
    </div>
  );
}
