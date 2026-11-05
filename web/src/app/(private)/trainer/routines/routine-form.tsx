"use client";
import { useActionState } from "react";
import { createRoutine, type FormState } from "../actions";

export function RoutineForm({ students, preselected }: { students: { id: string; name: string }[]; preselected?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createRoutine, {});
  return (
    <section className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-200 p-5">
      <h2 className="font-display text-2xl font-bold">Nueva rutina</h2>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Para
          <select name="student_id" className="select w-full" defaultValue={preselected ?? "template"}>
            <option value="template">Plantilla para el plan gratuito</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Nombre
          <input name="name" required maxLength={80} placeholder="Ej. Hipertrofia, 4 días" className="input w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Objetivo o indicaciones
          <textarea name="description" maxLength={1000} rows={3} className="textarea w-full" />
        </label>
        {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
        <button disabled={pending} className="btn btn-primary">{pending ? "Creando…" : "Crear y agregar ejercicios"}</button>
      </form>
      {students.length === 0 && <p className="text-xs text-muted">Todos tus alumnos ya tienen rutina; edítala desde su nombre.</p>}
    </section>
  );
}
