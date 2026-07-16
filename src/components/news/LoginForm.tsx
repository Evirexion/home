"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { login, type LoginState } from "@/app/(site)/news/internal/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="metal-edge mx-auto max-w-sm rounded-2xl border border-silver-300/15 bg-ink-raised p-8">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-electric/10 text-electric">
        <Lock className="h-5 w-5" />
      </div>
      <h1 className="text-xl font-semibold text-silver-100">Acceso interno</h1>
      <p className="mt-2 text-sm text-silver-500">
        Área para el equipo editorial de E-VIREXION. Ingresa la contraseña compartida para redactar borradores.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <input
          type="password"
          name="password"
          required
          placeholder="Contraseña"
          className="w-full rounded-xl border border-silver-300/15 bg-ink px-4 py-2.5 text-sm text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40"
        />
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient-bg metal-edge rounded-full px-5 py-2.5 text-sm font-semibold text-ink ease-in-out transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
