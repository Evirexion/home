import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons/SocialIcons";
import { HologramAccent } from "@/components/ui/HologramAccent";
import { CurrentLine } from "@/components/ui/CurrentLine";

const SOCIAL_LINKS = [
  { href: "https://instagram.com/evirexion", label: "Instagram", Icon: InstagramIcon },
  { href: "https://tiktok.com/@evirexion", label: "TikTok", Icon: TikTokIcon },
  { href: "https://facebook.com/evirexion", label: "Facebook", Icon: FacebookIcon },
];

const FOOTER_LINKS = [
  { href: "/map", label: "Mapa de carga" },
  { href: "/news", label: "Corriente" },
  { href: "/innovations", label: "Innovación" },
  { href: "/prices", label: "Precios" },
  { href: "/contact", label: "Contáctanos" },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-silver-700/15 bg-ink-raised">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(70% 60% at 15% 0%, rgba(29,158,117,0.14), transparent 65%)" }}
      />
      <CurrentLine className="h-5 w-full text-silver-700 opacity-50" />

      <Container className="flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo size="sm" />
          <p className="mt-3 text-sm text-silver-500">Driving the Electric Shift</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-silver-700">
            <HologramAccent className="h-2 w-2" />
            Diseñado y operado desde Colombia
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-silver-300 hover:text-electric">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-silver-500">Síguenos</p>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-silver-700/30 text-silver-300 transition-all duration-300 hover:scale-110 hover:border-electric/60 hover:text-electric hover:shadow-[0_0_18px_rgba(0,255,65,0.3)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </Container>
      <Container className="border-t border-silver-700/10 py-6">
        <p className="text-xs text-silver-700">
          © {new Date().getFullYear()} E-VIREXION. Todos los derechos reservados.
        </p>
      </Container>
    </footer>
  );
}
