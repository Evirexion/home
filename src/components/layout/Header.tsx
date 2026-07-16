"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/map", label: "Mapa" },
  { href: "/news", label: "CORRIENTE" },
  { href: "/innovations", label: "Innovación" },
  { href: "/prices", label: "Precios" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-silver-700/15 bg-ink/85 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between py-4">
        <Link href="/" aria-label="E-VIREXION, inicio" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex md:gap-2">
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

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-silver-300 transition-colors hover:bg-white/5 hover:text-electric md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <nav className="border-t border-silver-700/15 bg-ink/95 backdrop-blur-md md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-silver-300 transition-colors hover:bg-white/5 hover:text-electric"
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </nav>
      )}
    </header>
  );
}
