import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { GoogleConsentForm } from "@/components/account/forms";
import { readPendingGoogleSignup } from "@/lib/accounts";

export const metadata: Metadata = { title: "Completa tu registro", robots: { index: false } };

export default async function GoogleConsentPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const pending = t ? await readPendingGoogleSignup(t) : null;
  return (
    <AuthShell
      eyebrow="Último paso"
      title="Completa tu registro"
      description="Antes de crear tu cuenta con Google necesitamos tu autorización para el tratamiento de tus datos."
    >
      {pending && t ? (
        <GoogleConsentForm token={t} name={pending.name} email={pending.email} />
      ) : (
        <p className="text-sm text-silver-300">
          Este paso venció.{" "}
          <Link href="/cuenta/registro" className="text-electric hover:underline">
            Vuelve a intentarlo
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
