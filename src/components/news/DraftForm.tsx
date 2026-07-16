"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitDraft, type DraftFormState } from "@/app/(site)/news/internal/actions";

const initialState: DraftFormState = {};

const inputClass =
  "w-full rounded-xl border border-silver-300/15 bg-ink px-4 py-2.5 text-sm text-silver-100 outline-none ease-in-out transition-colors focus:border-electric/40";

export function DraftForm() {
  const [state, formAction, pending] = useActionState(submitDraft, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="metal-edge rounded-2xl border border-silver-300/15 bg-ink-raised p-6 md:p-8">
      <h2 className="text-lg font-semibold text-silver-100">Nuevo borrador</h2>
      <p className="mt-1 text-sm text-silver-500">
        Se guarda en Sanity con estado &ldquo;pending&rdquo;. Un editor debe revisarlo y publicarlo desde el Studio
        antes de que aparezca en el sitio público.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-silver-300">
            Título
            <input type="text" name="title" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-silver-300">
            Categoría
            <select name="category" defaultValue="corriente" className={inputClass}>
              <option value="corriente">CORRIENTE (Noticias)</option>
              <option value="innovations">Innovación</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-silver-300">
            Tag
            <input type="text" name="tag" required placeholder="Ej. Infraestructura" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-silver-300">
            Autor
            <input type="text" name="author" placeholder="Redacción E-VIREXION" className={inputClass} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-silver-300">
          Extracto
          <textarea name="excerpt" required rows={2} maxLength={240} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-silver-300">
          Cuerpo
          <textarea name="body" required rows={8} className={inputClass} />
        </label>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-mint">Borrador enviado. Revísalo en Sanity Studio.</p>}

        <button
          type="submit"
          disabled={pending}
          className="brand-gradient-bg metal-edge self-start rounded-full px-6 py-2.5 text-sm font-semibold text-ink ease-in-out transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar borrador"}
        </button>
      </form>
    </div>
  );
}
