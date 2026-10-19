import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { RegisterForm } from "@/components/account/forms";
import { getCurrentUser } from "@/lib/accounts";
import { isGoogleConfigured } from "@/lib/accounts/google";
import { GoogleButton } from "@/components/account/GoogleButton";

export const metadata: Metadata = {
  title: "Crea tu cuenta",
  description: "Regístrate gratis y lee la revista E-VIREXION completa.",
};

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/revista");
  return (
    <AuthShell
      eyebrow="Revista digital"
      title="Lee E-VIREXION completa, gratis"
      description="Crea tu cuenta para abrir cada edición página por página: historia, regulación, mercado y la guía de precios de todos los eléctricos de Colombia."
    >
      {isGoogleConfigured() && <GoogleButton label="Registrarme con Google" />}
      <div className={isGoogleConfigured() ? "mt-4" : undefined}>
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
