import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getCurrentUser, isAdmin, listSubscribers } from "@/lib/accounts";

export const metadata: Metadata = { title: "Suscriptores", robots: { index: false } };

export default async function SubscribersPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) notFound();

  const all = await listSubscribers();
  const active = all.filter((s) => s.verified);
  const marketing = active.filter((s) => s.marketingConsent);
  const pending = all.length - active.length;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "short", year: "numeric" });

  const stat = "rounded-2xl border border-silver-300/15 bg-ink-raised p-5";
  const button =
    "inline-flex items-center gap-2 rounded-full border border-electric/40 px-5 py-2 text-sm font-semibold text-electric transition-colors hover:bg-electric/10";

  return (
    <div className="py-16 md:py-20">
      <Container>
        <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm text-silver-500 hover:text-electric">
          <ArrowLeft className="h-4 w-4" /> Mi cuenta
        </Link>
        <h1 className="mt-3 font-display text-4xl font-bold text-silver-100">Suscriptores</h1>
        <p className="mt-2 text-sm text-silver-500">
          Datos personales protegidos por la Ley 1581: úsalos solo para las finalidades autorizadas y envía novedades
          únicamente a quienes las aceptaron.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={stat}>
            <p className="font-display text-4xl font-bold text-silver-100">{active.length}</p>
            <p className="mt-1 text-sm text-silver-500">Lectores activos</p>
          </div>
          <div className={stat}>
            <p className="font-display text-4xl font-bold brand-gradient-text">{marketing.length}</p>
            <p className="mt-1 text-sm text-silver-500">Aceptan recibir novedades</p>
          </div>
          <div className={stat}>
            <p className="font-display text-4xl font-bold text-silver-300">{pending}</p>
            <p className="mt-1 text-sm text-silver-500">Sin confirmar el correo</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/api/cuenta/suscriptores" className={button}>
            <Download className="h-4 w-4" /> Descargar todos (Excel)
          </a>
          <a href="/api/cuenta/suscriptores?filtro=novedades" className={button}>
            <Download className="h-4 w-4" /> Solo quienes aceptan novedades
          </a>
        </div>

        <div className="metal-edge mt-8 overflow-x-auto rounded-2xl border border-silver-300/15 bg-ink-raised">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-silver-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Novedades</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody>
              {all.map((s) => (
                <tr key={s.email} className="border-t border-silver-300/10">
                  <td className="px-4 py-3 text-silver-100">{s.name}</td>
                  <td className="px-4 py-3 text-silver-300">{s.email}</td>
                  <td className="px-4 py-3">{s.marketingConsent ? <span className="text-mint">Sí</span> : <span className="text-silver-500">No</span>}</td>
                  <td className="px-4 py-3 text-silver-500">{s.verified ? "Activo" : "Sin confirmar"}</td>
                  <td className="px-4 py-3 text-silver-500">{fmt(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {all.length === 0 && <p className="p-6 text-center text-sm text-silver-500">Todavía no hay lectores registrados.</p>}
        </div>
      </Container>
    </div>
  );
}
