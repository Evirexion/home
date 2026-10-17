import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { VerifyForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Activa tu cuenta", robots: { index: false } };

/**
 * The email link lands here and the reader confirms with a button, instead of
 * activating on page load — email scanners open links automatically and would
 * otherwise use up the token before the reader does.
 */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell eyebrow="Último paso" title="Activa tu cuenta" description="Confirma tu correo y entra directo a la revista.">
      {token ? (
        <VerifyForm token={token} />
      ) : (
        <p className="text-sm text-silver-300">
          Falta el código del enlace. Abre de nuevo el enlace del correo o{" "}
          <Link href="/cuenta/ingresar" className="text-electric hover:underline">
            ingresa
          </Link>{" "}
          para recibir uno nuevo.
        </p>
      )}
    </AuthShell>
  );
}
