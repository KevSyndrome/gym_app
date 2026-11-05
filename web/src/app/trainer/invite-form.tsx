"use client";
import { useActionState } from "react";
import { inviteStudent, type InviteState } from "./actions";

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteStudent, {});
  return (
    <form action={action} className="flex flex-col gap-3 rounded border p-4">
      <h2 className="font-semibold">Invitar alumno</h2>
      <label className="flex flex-col gap-1">
        Nombre
        <input name="full_name" required maxLength={120} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1">
        Correo
        <input name="email" type="email" required maxLength={254} className="rounded border p-2" />
      </label>
      {state.error && <p role="alert" className="text-red-600">{state.error}</p>}
      {state.ok && <p role="status" className="text-green-700">{state.ok}</p>}
      <button disabled={pending} className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50">
        {pending ? "Enviando…" : "Enviar invitación"}
      </button>
    </form>
  );
}
