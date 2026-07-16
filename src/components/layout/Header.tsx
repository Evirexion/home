import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/map", label: "Mapa" },
  { href: "/news", label: "CORRIENTE" },
  { href: "/innovations", label: "Innovación" },
  { href: "/prices", label: "Precios" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-silver-700/15 bg-ink/85 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between py-4">
        <Link href="/" aria-label="E-VIREXION, inicio">
          <Logo size="sm" />
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative rounded-full px-3 py-2 text-sm font-medium text-silver-300 transition-colors hover:bg-white/5 hover:text-electric md:px-4"
            >
              {link.label}
              <span className="absolute inset-x-3 bottom-1 h-px scale-x-0 bg-electric transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
