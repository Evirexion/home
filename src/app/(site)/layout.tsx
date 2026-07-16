import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <div aria-hidden className="site-atmosphere pointer-events-none fixed inset-0 -z-30" />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
