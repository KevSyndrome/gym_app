"use client";
import { useActionState } from "react";
import { DAYS } from "@/lib/routine";
import { addItem, type FormState } from "../../actions";

type Exercise = { id: string; name: string; muscle_group: string };

export function AddItemForm({ routineId, exercises, groups }: { routineId: string; exercises: Exercise[]; groups: string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addItem, {});
  return (
    <section className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-200 p-5 md:sticky md:top-6">
      <h2 className="font-display text-2xl font-bold">Agregar ejercicio</h2>
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="routine_id" value={routineId} />
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Día
          <select name="day" required className="select w-full" defaultValue="1">
            {DAYS.map((d, i) => (
              <option key={d} value={i + 1}>{d}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Ejercicio
          <select name="exercise_id" required className="select w-full" defaultValue="">
            <option value="" disabled>Elige uno</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {exercises.filter((e) => e.muscle_group === g).map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            Series
            <input name="sets" type="number" required min={1} max={20} defaultValue={3} className="input w-full" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            Repeticiones
            <input name="reps" required maxLength={20} placeholder="10 u 8-12" className="input w-full" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            Peso (kg)
            <input name="weight_kg" inputMode="decimal" placeholder="Opcional" className="input w-full" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            Descanso (s)
            <input name="rest_seconds" type="number" min={0} max={900} step={15} placeholder="90" className="input w-full" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Notas para el alumno
          <input name="notes" maxLength={500} placeholder="Ej. bajar en 3 segundos" className="input w-full" />
        </label>
        {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
        {state.ok && <p role="status" className="text-sm text-success">{state.ok}</p>}
        <button disabled={pending} className="btn btn-primary">{pending ? "Agregando…" : "Agregar a la rutina"}</button>
      </form>
    </section>
  );
}
