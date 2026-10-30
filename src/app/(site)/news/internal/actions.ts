"use server";

import { cookies } from "next/headers";
import { createSessionValue, INTERNAL_SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { createDraftPost } from "@/lib/posts";
import type { PostCategory } from "@/types/content";
import { timingSafeEqual } from "@/lib/accounts/crypto";
import { RATE_LIMITED_MESSAGE, rateLimit } from "@/lib/rateLimit";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const expected = process.env.INTERNAL_NEWS_PASSWORD;

  if (!expected) {
    return { error: "INTERNAL_NEWS_PASSWORD no está configurada en el servidor." };
  }
  if (!(await rateLimit("internal-login"))) return { error: RATE_LIMITED_MESSAGE };
  if (typeof password !== "string" || !timingSafeEqual(password, expected)) {
    return { error: "Contraseña incorrecta." };
  }

  const value = await createSessionValue();
  const cookieStore = await cookies();
  cookieStore.set(INTERNAL_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/news/internal",
  });
  return {};
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(INTERNAL_SESSION_COOKIE);
}

export interface DraftFormState {
  error?: string;
  success?: boolean;
}

export async function submitDraft(_prevState: DraftFormState, formData: FormData): Promise<DraftFormState> {
  const cookieStore = await cookies();
  const authed = await isValidSession(cookieStore.get(INTERNAL_SESSION_COOKIE)?.value);
  if (!authed) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "corriente") as PostCategory;
  const tag = String(formData.get("tag") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();

  if (!title || !tag || !excerpt || !body) {
    return { error: "Completa título, tag, extracto y cuerpo antes de enviar." };
  }
  if (title.length > 300 || tag.length > 80 || excerpt.length > 1000 || body.length > 100_000 || author.length > 120) {
    return { error: "Algún campo es demasiado largo." };
  }
  if (!["corriente", "innovations"].includes(category)) {
    return { error: "Categoría no válida." };
  }

  const result = await createDraftPost({ title, category, tag, excerpt, body, author });
  if (!result.ok) {
    return { error: result.error };
  }
  return { success: true };
}
