export type ContactReason = "publicidad" | "talleres" | "prensa" | "otro";

export const CONTACT_REASONS: { value: ContactReason; label: string; email: string }[] = [
  { value: "publicidad", label: "Publicidad y alianzas", email: "publicidad@evirexion.com" },
  { value: "talleres", label: "Talleres y estaciones de carga", email: "talleres@evirexion.com" },
  { value: "prensa", label: "Prensa y negocios", email: "gerencia@evirexion.com" },
  { value: "otro", label: "Otro / Comentarios generales", email: "contacto@evirexion.com" },
];

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  reason: ContactReason;
}

/** Sends the message via Resend's REST API, no SDK dependency required. */
export async function sendContactMessage(
  input: ContactInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "El envío de correo no está configurado todavía en el servidor (RESEND_API_KEY).",
    };
  }

  const target = CONTACT_REASONS.find((r) => r.value === input.reason);
  if (!target) {
    return { ok: false, error: "Motivo no válido." };
  }

  const from = process.env.CONTACT_FROM_EMAIL || "E-VIREXION <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: target.email,
      reply_to: input.email,
      subject: `[Contacto E-VIREXION] ${target.label} — ${input.name}`,
      text: `Nombre: ${input.name}\nCorreo: ${input.email}\nMotivo: ${target.label}\n\nMensaje:\n${input.message}`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Resend API error", response.status, detail);
    return { ok: false, error: "No se pudo enviar el mensaje. Intenta de nuevo en unos minutos." };
  }

  return { ok: true };
}
