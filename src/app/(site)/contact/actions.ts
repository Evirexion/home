"use server";

import { RATE_LIMITED_MESSAGE, rateLimit } from "@/lib/rateLimit";
import { CONTACT_REASONS, sendContactMessage, type ContactReason } from "@/lib/contact";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Bots fill every field; people never see this one.
  if (String(formData.get("website") ?? "")) return { success: true };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const reason = String(formData.get("reason") ?? "") as ContactReason;

  if (!name || !email || !message) {
    return { error: "Completa nombre, correo y mensaje antes de enviar." };
  }
  if (name.length > 120 || email.length > 254 || message.length > 5000) {
    return { error: "El mensaje es demasiado largo (máximo 5.000 caracteres)." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Ingresa un correo electrónico válido." };
  }
  if (!CONTACT_REASONS.some((r) => r.value === reason)) {
    return { error: "Selecciona un motivo válido." };
  }

  if (!(await rateLimit("contact"))) return { error: RATE_LIMITED_MESSAGE };

  const result = await sendContactMessage({ name, email, message, reason });
  if (!result.ok) {
    return { error: result.error };
  }
  return { success: true };
}
