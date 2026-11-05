"use client";
import { useActionState, useState } from "react";
import { inviteStudent, type InviteState } from "./actions";

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteStudent, {});
  const [copied, setCopied] = useState(false);

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">Invitar alumno</h2>
        <p className="text-sm text-muted">Crea un enlace para que elija su contraseña y entre.</p>
      </div>
      <form action={action} className="flex flex-col gap-4">
        <label className="label">
          Nombre
          <input name="full_name" required maxLength={120} className="input" />
        </label>
        <label className="label">
          Correo
          <input name="email" type="email" required maxLength={254} className="input" />
        </label>
        {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="btn" onClick={() => setCopied(false)}>
          {pending ? "Creando enlace…" : "Crear enlace de invitación"}
        </button>
      </form>

      {state.link && (
        <div role="status" className="flex flex-col gap-3 border-t border-line pt-4">
          <p className="text-sm">{state.ok}</p>
          {/* El enlace da acceso a la cuenta: solo lo ve el entrenador y no se guarda. */}
          <input readOnly value={state.link} aria-label="Enlace de invitación" className="input text-xs" onFocus={(e) => e.target.select()} />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigator.clipboard.writeText(state.link!).then(() => setCopied(true))}
          >
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </button>
        </div>
      )}
    </section>
  );
}
