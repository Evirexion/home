"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  AccountError,
  authenticate,
  createUser,
  deleteAccount,
  endSession,
  getCurrentUser,
  issuePasswordResetToken,
  issueVerificationToken,
  resetPassword,
  startSession,
  updateProfile,
  validatePassword,
  verifyEmail,
} from "@/lib/accounts";
import { isMailerConfigured, sendPasswordResetEmail, sendVerificationEmail } from "@/lib/accounts/mailer";

export interface FormState {
  error?: string;
  message?: string;
  done?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "evirexion.com";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

/** Only allow redirects back into this site after login. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/revista";
}

function friendly(error: unknown): FormState {
  if (error instanceof AccountError) return { error: error.message };
  console.error(error);
  return { error: "Algo salió mal. Intenta de nuevo en unos minutos." };
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  // Bots fill every field; people never see this one.
  if (String(formData.get("website") ?? "")) return { done: true, message: "Revisa tu correo." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const privacy = formData.get("privacy") === "on";
  const marketing = formData.get("marketing") === "on";

  if (!name || !email || !password) return { error: "Completa nombre, correo y contraseña." };
  if (!EMAIL_RE.test(email)) return { error: "Ingresa un correo electrónico válido." };
  const passwordProblem = validatePassword(password);
  if (passwordProblem) return { error: passwordProblem };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };
  if (!privacy) {
    return { error: "Para crear tu cuenta necesitamos tu autorización para el tratamiento de datos personales." };
  }
  if (!isMailerConfigured()) {
    return { error: "El registro abre muy pronto: estamos terminando de configurar el envío de correos." };
  }

  try {
    const ip = (await headers()).get("cf-connecting-ip");
    const { user } = await createUser({ name, email, password, marketingConsent: marketing, ip });
    if (!user.emailVerified) {
      const token = await issueVerificationToken(user.id);
      if (token) {
        const origin = await siteOrigin();
        const url = `${origin}/cuenta/verificar?token=${token}`;
        const sent = await sendVerificationEmail(user.email, user.name, url, origin);
        if (!sent.ok) return { error: sent.error };
      }
    }
    // Same answer whether or not the address already had an account.
    return {
      done: true,
      message: `Te enviamos un enlace a ${email}. Ábrelo para activar tu cuenta (revisa también spam o promociones).`,
    };
  } catch (error) {
    return friendly(error);
  }
}

export async function confirmEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  let ok = false;
  try {
    const user = await verifyEmail(token);
    if (user) {
      await startSession(user.id);
      ok = true;
    }
  } catch (error) {
    return friendly(error);
  }
  if (ok) redirect("/revista?bienvenida=1");
  return { error: "El enlace no es válido o ya venció. Ingresa con tu correo y te enviaremos uno nuevo." };
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!email || !password) return { error: "Escribe tu correo y contraseña." };

  let ok = false;
  try {
    const result = await authenticate(email, password);
    if (result.ok) {
      await startSession(result.user.id);
      ok = true;
    } else if (result.reason === "locked") {
      return { error: "Demasiados intentos. Espera 15 minutos o cambia tu contraseña." };
    } else if (result.reason === "unverified" && result.user) {
      const token = await issueVerificationToken(result.user.id);
      if (token) {
        const origin = await siteOrigin();
        const url = `${origin}/cuenta/verificar?token=${token}`;
        await sendVerificationEmail(result.user.email, result.user.name, url, origin);
        return { error: "Aún no has confirmado tu correo. Te enviamos de nuevo el enlace de activación." };
      }
      return { error: "Aún no has confirmado tu correo. Revisa tu bandeja (y spam); en un minuto puedes pedir otro enlace." };
    } else {
      return { error: "Correo o contraseña incorrectos." };
    }
  } catch (error) {
    return friendly(error);
  }
  if (ok) redirect(next);
  return {};
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function requestReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { error: "Ingresa un correo electrónico válido." };
  try {
    const issued = await issuePasswordResetToken(email);
    if (issued) {
      const origin = await siteOrigin();
      const url = `${origin}/cuenta/restablecer?token=${issued.token}`;
      await sendPasswordResetEmail(issued.user.email, url, origin);
    }
  } catch (error) {
    return friendly(error);
  }
  return {
    done: true,
    message: "Si ese correo tiene una cuenta, te llegará un enlace para crear una nueva contraseña.",
  };
}

export async function completeReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const problem = validatePassword(password);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };

  let ok = false;
  try {
    const user = await resetPassword(token, password);
    if (user) {
      await startSession(user.id);
      ok = true;
    }
  } catch (error) {
    return friendly(error);
  }
  if (ok) redirect("/cuenta?clave=actualizada");
  return { error: "El enlace no es válido o ya venció. Pide uno nuevo." };
}

export async function savePreferences(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/ingresar");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre no puede quedar vacío." };
  try {
    await updateProfile(user.id, { name, marketingConsent: formData.get("marketing") === "on" });
  } catch (error) {
    return friendly(error);
  }
  return { message: "Cambios guardados." };
}

export async function removeAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/ingresar");
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "ELIMINAR") {
    return { error: 'Escribe ELIMINAR para confirmar.' };
  }
  try {
    await deleteAccount(user.id);
  } catch (error) {
    return friendly(error);
  }
  redirect("/?cuenta=eliminada");
}
