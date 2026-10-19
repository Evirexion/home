/** Transactional email for reader accounts, sent with Resend's REST API. */

interface Email {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

async function send(email: Email): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "El envío de correos aún no está configurado. Intenta más tarde." };
  }
  const from = email.from || process.env.ACCOUNT_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || "E-VIREXION <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: email.to, subject: email.subject, text: email.text, html: email.html }),
  });
  if (!response.ok) {
    console.error("Resend error", response.status, await response.text().catch(() => ""));
    return { ok: false, error: "No pudimos enviar el correo. Intenta de nuevo en unos minutos." };
  }
  return { ok: true };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(origin: string, title: string, intro: string, buttonLabel: string, url: string, footnote: string): string {
  const logo = `${origin}/brand/email-logo.png`;
  return `<!doctype html><html lang="es"><body style="margin:0;background:#0a0c0b;font-family:Inter,Arial,sans-serif;color:#cdd3d1">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0c0b;padding:32px 16px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#12140f;border:1px solid #2a302d;border-radius:16px;padding:32px">
<tr><td><img src="${escapeHtml(logo)}" width="260" height="46" alt="E-VIREXION" style="display:block;border:0;outline:none;width:260px;height:auto;font-size:18px;letter-spacing:4px;color:#00ff41"></td></tr>
<tr><td style="padding-top:20px;border-bottom:1px solid #2a302d"></td></tr>
<tr><td style="padding-top:16px;font-size:24px;font-weight:700;color:#f4f6f5">${escapeHtml(title)}</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.6">${escapeHtml(intro)}</td></tr>
<tr><td style="padding-top:24px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#00ff41;color:#0a0c0b;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">${escapeHtml(buttonLabel)}</a></td></tr>
<tr><td style="padding-top:24px;font-size:12px;line-height:1.5;color:#9aa3a0">${escapeHtml(footnote)}<br><br>Si el botón no funciona, copia este enlace:<br><span style="color:#4fffb0;word-break:break-all">${escapeHtml(url)}</span></td></tr>
</table></td></tr></table></body></html>`;
}

export function sendVerificationEmail(to: string, name: string, url: string, origin: string) {
  const intro = `Hola ${name}, confirma tu correo para activar tu cuenta y leer la revista completa.`;
  const footnote = "El enlace vence en 24 horas. Si no creaste esta cuenta, ignora este mensaje.";
  return send({
    to,
    subject: "Confirma tu correo — E-VIREXION",
    text: `${intro}\n\n${url}\n\n${footnote}`,
    html: layout(origin, "Confirma tu correo", intro, "Confirmar correo", url, footnote),
  });
}

/** Where new-reader notifications go. */
export const NOTIFY_EMAIL = process.env.ACCOUNT_NOTIFY_EMAIL || "cuentas@evirexion.com";

/** Internal heads-up to the team when a reader activates their account. */
export function sendNewSubscriberNotice(
  reader: { name: string; email: string; marketingConsent: boolean },
  total: number,
  origin: string
) {
  const when = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "long", timeStyle: "short" });
  const lines = [
    `Nombre: ${reader.name}`,
    `Correo: ${reader.email}`,
    `Quiere recibir novedades: ${reader.marketingConsent ? "Sí" : "No"}`,
    `Fecha: ${when}`,
    `Total de lectores activos: ${total}`,
  ];
  const intro = lines.join(" · ");
  return send({
    // Not from cuentas@ itself: Google Groups may drop mail that appears to come from the group.
    from: process.env.NOTIFY_FROM_EMAIL || "E-VIREXION Web <notificaciones@evirexion.com>",
    to: NOTIFY_EMAIL,
    subject: `Nuevo lector: ${reader.name}`,
    text: `Un nuevo lector activó su cuenta en E-VIREXION.\n\n${lines.join("\n")}\n\nLista completa: ${origin}/cuenta/suscriptores`,
    html: layout(origin, "Nuevo lector registrado", intro, "Ver suscriptores", `${origin}/cuenta/suscriptores`, "Aviso interno de evirexion.com."),
  });
}

/** Someone tried to sign up with an address that already has an active account. */
export function sendAccountExistsEmail(to: string, name: string, loginUrl: string, resetUrl: string, origin: string) {
  const intro = `Hola ${name}, alguien (probablemente tú) intentó crear una cuenta con este correo, pero ya tienes una cuenta activa en E-VIREXION. Solo ingresa con tu contraseña.`;
  const footnote = `¿No recuerdas tu contraseña? Crea una nueva aquí (vence en 1 hora): ${resetUrl}`;
  return send({
    to,
    subject: "Ya tienes una cuenta en E-VIREXION",
    text: `${intro}

Ingresar: ${loginUrl}

${footnote}`,
    html: layout(origin, "Ya tienes una cuenta", intro, "Ingresar", loginUrl, footnote),
  });
}

export function sendPasswordResetEmail(to: string, url: string, origin: string) {
  const intro = "Recibimos una solicitud para cambiar la contraseña de tu cuenta E-VIREXION.";
  const footnote = "El enlace vence en 1 hora. Si no lo pediste, ignora este mensaje: tu contraseña no cambia.";
  return send({
    to,
    subject: "Cambia tu contraseña — E-VIREXION",
    text: `${intro}\n\n${url}\n\n${footnote}`,
    html: layout(origin, "Cambia tu contraseña", intro, "Crear nueva contraseña", url, footnote),
  });
}
