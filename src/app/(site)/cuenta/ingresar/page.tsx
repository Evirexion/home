import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/forms";
import { getCurrentUser } from "@/lib/accounts";
import { isGoogleConfigured } from "@/lib/accounts/google";
import { GoogleButton } from "@/components/account/GoogleButton";

export const metadata: Metadata = { title: "Ingresa" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/revista";
  if (await getCurrentUser()) redirect(target);
  return (
    <AuthShell eyebrow="Tu cuenta" title="Bienvenido de nuevo" description="Ingresa para seguir leyendo la revista.">
      {error === "google" && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          No pudimos iniciar sesión con Google. Intenta de nuevo o ingresa con tu correo.
        </p>
      )}
      {isGoogleConfigured() && <GoogleButton next={target} />}
      <div className={isGoogleConfigured() ? "mt-4" : undefined}>
        <LoginForm next={target} />
      </div>
    </AuthShell>
  );
}
