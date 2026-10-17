import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthShell";
import { ForgotForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Recupera tu contraseña" };

export default function ForgotPage() {
  return (
    <AuthShell
      eyebrow="Tu cuenta"
      title="¿Olvidaste tu contraseña?"
      description="Escribe tu correo y te enviaremos un enlace para crear una nueva."
    >
      <ForgotForm />
    </AuthShell>
  );
}
