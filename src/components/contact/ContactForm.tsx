"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitContact, type ContactFormState } from "@/app/(site)/contact/actions";
import { CONTACT_REASONS } from "@/lib/contact";

const initialState: ContactFormState = {};

const inputClass =
  "w-full rounded-xl border border-silver-300/15 bg-ink px-4 py-2.5 text-sm text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-6 md:p-8">
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-silver-300">
            Nombre
            <input type="text" name="name" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-silver-300">
            Correo
            <input type="email" name="email" required className={inputClass} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-silver-300">
          Motivo
          <select name="reason" defaultValue="otro" className={inputClass}>
            {CONTACT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-silver-300">
          Mensaje
          <textarea name="message" required rows={6} className={inputClass} />
        </label>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-mint">Mensaje enviado. Te responderemos pronto.</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="brand-gradient-bg metal-edge self-start rounded-full px-6 py-2.5 text-sm font-semibold text-ink ease-in-out transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>
    </div>
  );
}
