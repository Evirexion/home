import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/forms";
import { getCurrentUser } from "@/lib/accounts";

export const metadata: Metadata = { title: "Ingresa" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/revista";
  if (await getCurrentUser()) redirect(target);
  return (
    <AuthShell eyebrow="Tu cuenta" title="Bienvenido de nuevo" description="Ingresa para seguir leyendo la revista.">
      <LoginForm next={target} />
    </AuthShell>
  );
}
