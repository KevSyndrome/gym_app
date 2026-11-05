"use client";
import { useActionState } from "react";
import { CopyLink } from "@/components/copy-link";
import { inviteStudent, type FormState } from "./actions";

export function InviteForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(inviteStudent, {});

  return (
    <section className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-200 p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">Invitar alumno</h2>
        <p className="text-sm text-muted">Crea un enlace para que elija su contraseña y entre. Empieza en el plan gratuito.</p>
      </div>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Nombre
          <input name="full_name" required maxLength={120} className="input w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Correo
          <input name="email" type="email" required maxLength={254} className="input w-full" />
        </label>
        {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
        <button disabled={pending} className="btn btn-primary">
          {pending ? "Creando enlace…" : "Crear enlace de invitación"}
        </button>
      </form>
      {state.link && (
        <div className="border-t border-base-300 pt-4">
          <CopyLink key={state.link} link={state.link} message={state.ok} />
        </div>
      )}
    </section>
  );
}
