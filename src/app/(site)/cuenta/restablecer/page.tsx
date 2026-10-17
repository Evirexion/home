import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/AuthShell";
import { ResetForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell eyebrow="Tu cuenta" title="Crea una nueva contraseña">
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-sm text-silver-300">
          Este enlace está incompleto.{" "}
          <Link href="/cuenta/recuperar" className="text-electric hover:underline">
            Pide uno nuevo
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
