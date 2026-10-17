import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DeleteAccountForm, PreferencesForm } from "@/components/account/forms";
import { logout } from "./actions";
import { getCurrentUser } from "@/lib/accounts";
import { DATA_CONTROLLER, PRIVACY_POLICY_PATH } from "@/lib/legal";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/ingresar?next=/cuenta");
  const { clave } = await searchParams;

  const card = "metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-6 md:p-8";
  return (
    <div className="py-16 md:py-20">
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-electric">Mi cuenta</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-silver-100">Hola, {user.name}</h1>
        <p className="mt-2 text-silver-500">{user.email}</p>
        {clave && <p className="mt-4 text-sm text-mint">Tu contraseña se actualizó.</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/revista"
            className="brand-gradient-bg metal-edge inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-ink"
          >
            <BookOpen className="h-4 w-4" /> Leer la revista
          </Link>
          <form action={logout}>
            <button className="rounded-full border border-silver-300/20 px-6 py-2.5 text-sm text-silver-300 hover:text-silver-100">
              Cerrar sesión
            </button>
          </form>
        </div>

        <section className={`${card} mt-10`}>
          <h2 className="text-lg font-semibold text-silver-100">Tus datos y preferencias</h2>
          <div className="mt-5">
            <PreferencesForm name={user.name} marketing={user.marketingConsent} />
          </div>
        </section>

        <section className={`${card} mt-6`}>
          <h2 className="text-lg font-semibold text-silver-100">Tus derechos sobre tus datos</h2>
          <p className="mt-3 text-sm leading-relaxed text-silver-500">
            Puedes conocer, actualizar y rectificar tus datos aquí mismo, y para cualquier consulta o reclamo escribir a{" "}
            <a href={`mailto:${DATA_CONTROLLER.email}`} className="text-electric hover:underline">
              {DATA_CONTROLLER.email}
            </a>
            . Consulta la{" "}
            <Link href={PRIVACY_POLICY_PATH} className="text-electric hover:underline">
              Política de Tratamiento de Datos
            </Link>
            .
          </p>
          <div className="mt-6 border-t border-silver-300/10 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-silver-300">Eliminar cuenta</h3>
            <div className="mt-3">
              <DeleteAccountForm />
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
