"use client";
import { useActionState } from "react";
import { createExercise, deleteExercise, type FormState } from "../actions";

export function ExerciseForm({ groups, equipment }: { groups: string[]; equipment: string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createExercise, {});
  return (
    <section className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-200 p-5 md:sticky md:top-6">
      <h2 className="font-display text-2xl font-bold">Nuevo ejercicio</h2>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Nombre
          <input name="name" required maxLength={80} className="input w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Grupo muscular
          <select name="muscle_group" required className="select w-full capitalize" defaultValue="">
            <option value="" disabled>Elige uno</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Equipo
          <select name="equipment" className="select w-full capitalize" defaultValue="">
            <option value="">Sin especificar</option>
            {equipment.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Cómo se hace
          <textarea name="description" maxLength={2000} rows={4} className="textarea w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Imagen (JPG, PNG o WEBP, hasta 2 MB)
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="file-input w-full" />
        </label>
        {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
        {state.ok && <p role="status" className="text-sm text-success">{state.ok}</p>}
        <button disabled={pending} className="btn btn-primary">{pending ? "Guardando…" : "Agregar al catálogo"}</button>
      </form>
    </section>
  );
}

export function DeleteExerciseButton({ exerciseId, name }: { exerciseId: string; name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(deleteExercise, {});
  return (
    <form action={action} className="flex shrink-0 flex-col items-end gap-1">
      <input type="hidden" name="exercise_id" value={exerciseId} />
      <button disabled={pending} className="btn btn-ghost btn-xs text-muted" aria-label={`Borrar ${name}`}>
        Borrar
      </button>
      {state.error && <p role="alert" className="max-w-40 text-right text-xs text-error">{state.error}</p>}
    </form>
  );
}
