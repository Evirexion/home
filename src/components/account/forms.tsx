"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  completeReset,
  confirmEmail,
  login,
  register,
  removeAccount,
  requestReset,
  savePreferences,
  type FormState,
} from "@/app/(site)/cuenta/actions";
import { DATA_CONTROLLER, PRIVACY_POLICY_PATH } from "@/lib/legal";

const initial: FormState = {};

export const inputClass =
  "w-full rounded-xl border border-silver-300/15 bg-ink px-4 py-2.5 text-sm text-silver-100 outline-none transition-colors ease-in-out focus:border-electric/50";

const primaryButton =
  "brand-gradient-bg metal-edge w-full rounded-full px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 ease-in-out hover:scale-[1.01] disabled:opacity-60";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-silver-300">
      {label}
      {children}
      {hint && <span className="text-xs text-silver-500">{hint}</span>}
    </label>
  );
}

function PasswordInput({ name, autoComplete }: { name: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        required
        minLength={8}
        autoComplete={autoComplete}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-silver-500 hover:text-silver-100"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Feedback({ state }: { state: FormState }) {
  if (state.error) return <p role="alert" className="text-sm text-red-400">{state.error}</p>;
  if (state.message) return <p role="status" className="text-sm text-mint">{state.message}</p>;
  return null;
}

function Sent({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-electric/30 bg-electric/5 p-5 text-sm leading-relaxed text-silver-100">
      {message}
    </div>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initial);
  if (state.done) return <Sent message={state.message} />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Nombre">
        <input type="text" name="name" required autoComplete="name" maxLength={120} className={inputClass} />
      </Field>
      <Field label="Correo electrónico">
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Contraseña" hint="Mínimo 8 caracteres, con al menos una letra y un número.">
        <PasswordInput name="password" autoComplete="new-password" />
      </Field>
      <Field label="Repite la contraseña">
        <PasswordInput name="confirm" autoComplete="new-password" />
      </Field>
      {/* Honeypot: hidden from people, filled by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="rounded-xl border border-silver-300/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-silver-500">
        <p className="font-semibold uppercase tracking-wide text-silver-300">Aviso de privacidad</p>
        <p className="mt-2">
          {DATA_CONTROLLER.legalName}, con domicilio en {DATA_CONTROLLER.city}, es responsable del tratamiento de los
          datos que registras (nombre, correo y contraseña cifrada). Los usamos para crear y administrar tu cuenta,
          darte acceso a la revista digital y, solo si lo autorizas, enviarte novedades de E-VIREXION. Tienes derecho a
          conocer, actualizar, rectificar y suprimir tus datos, y a revocar esta autorización, escribiendo a{" "}
          <a href={`mailto:${DATA_CONTROLLER.email}`} className="text-electric underline underline-offset-2">
            {DATA_CONTROLLER.email}
          </a>{" "}
          o desde tu cuenta. Más información en nuestra{" "}
          <Link href={PRIVACY_POLICY_PATH} target="_blank" className="text-electric underline underline-offset-2">
            Política de Tratamiento de Datos Personales
          </Link>
          .
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-silver-300">
        <input type="checkbox" name="privacy" required className="mt-0.5 h-4 w-4 accent-[#00ff41]" />
        <span>
          Autorizo de manera previa, expresa e informada el tratamiento de mis datos personales conforme a la{" "}
          <Link href={PRIVACY_POLICY_PATH} target="_blank" className="text-electric underline underline-offset-2">
            Política de Tratamiento de Datos
          </Link>{" "}
          (Ley 1581 de 2012).
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm text-silver-300">
        <input type="checkbox" name="marketing" className="mt-0.5 h-4 w-4 accent-[#00ff41]" />
        <span>Quiero recibir por correo las nuevas ediciones y novedades de E-VIREXION (opcional).</span>
      </label>

      <Feedback state={state} />
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Creando cuenta..." : "Crear cuenta gratis"}
      </button>
      <p className="text-center text-sm text-silver-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/cuenta/ingresar" className="text-electric hover:underline">
          Ingresa
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? "/revista"} />
      <Field label="Correo electrónico">
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Contraseña">
        <PasswordInput name="password" autoComplete="current-password" />
      </Field>
      <div className="-mt-1 text-right text-xs">
        <Link href="/cuenta/recuperar" className="text-silver-500 hover:text-electric">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
      <p className="text-center text-sm text-silver-500">
        ¿No tienes cuenta?{" "}
        <Link href="/cuenta/registro" className="text-electric hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}

export function VerifyForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmEmail, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Activando..." : "Activar mi cuenta"}
      </button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestReset, initial);
  if (state.done) return <Sent message={state.message} />;
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Correo electrónico">
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </Field>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Enviando..." : "Enviar enlace"}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(completeReset, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <Field label="Nueva contraseña" hint="Mínimo 8 caracteres, con al menos una letra y un número.">
        <PasswordInput name="password" autoComplete="new-password" />
      </Field>
      <Field label="Repite la contraseña">
        <PasswordInput name="confirm" autoComplete="new-password" />
      </Field>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Guardando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}

export function PreferencesForm({ name, marketing }: { name: string; marketing: boolean }) {
  const [state, action, pending] = useActionState(savePreferences, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Nombre">
        <input type="text" name="name" defaultValue={name} required maxLength={120} className={inputClass} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-silver-300">
        <input type="checkbox" name="marketing" defaultChecked={marketing} className="mt-0.5 h-4 w-4 accent-[#00ff41]" />
        <span>Recibir por correo las nuevas ediciones y novedades de E-VIREXION.</span>
      </label>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-electric/40 px-5 py-2 text-sm font-semibold text-electric transition-colors hover:bg-electric/10 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(removeAccount, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-sm text-silver-500">
        Esto borra tu cuenta y tus datos de forma definitiva. Para confirmar, escribe <strong className="text-silver-100">ELIMINAR</strong>.
      </p>
      <input type="text" name="confirm" autoComplete="off" className={inputClass} />
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-red-400/40 px-5 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-60"
      >
        {pending ? "Eliminando..." : "Eliminar mi cuenta"}
      </button>
    </form>
  );
}
