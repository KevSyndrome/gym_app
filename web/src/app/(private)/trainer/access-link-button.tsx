"use client";
import { useActionState } from "react";
import { CopyLink } from "@/components/copy-link";
import { newAccessLink, type FormState } from "./actions";

export function AccessLinkButton({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(newAccessLink, {});
  return (
    <div className="flex flex-col gap-2">
      <form action={action}>
        <input type="hidden" name="student_id" value={studentId} />
        <button disabled={pending} className="btn btn-ghost btn-xs text-muted">
          {pending ? "Creando…" : "Nuevo enlace de acceso"}
        </button>
      </form>
      {state.error && <p role="alert" className="text-xs text-error">{state.error}</p>}
      {state.link && <CopyLink key={state.link} link={state.link} message={state.ok} />}
    </div>
  );
}
