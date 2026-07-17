"use server";

import { CONTACT_REASONS, sendContactMessage, type ContactReason } from "@/lib/contact";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const reason = String(formData.get("reason") ?? "") as ContactReason;

  if (!name || !email || !message) {
    return { error: "Completa nombre, correo y mensaje antes de enviar." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Ingresa un correo electrónico válido." };
  }
  if (!CONTACT_REASONS.some((r) => r.value === reason)) {
    return { error: "Selecciona un motivo válido." };
  }

  const result = await sendContactMessage({ name, email, message, reason });
  if (!result.ok) {
    return { error: result.error };
  }
  return { success: true };
}
