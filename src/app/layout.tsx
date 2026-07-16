import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "E-VIREXION — Driving the Electric Shift",
    template: "%s | E-VIREXION",
  },
  description:
    "E-VIREXION es la revista de movilidad eléctrica premium para Colombia y Latinoamérica: noticias, innovación, mapa de carga y precios de vehículos eléctricos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-ink text-silver-100">{children}</body>
    </html>
  );
}
