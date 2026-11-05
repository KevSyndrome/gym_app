"use client";
import { useActionState } from "react";
import { DAYS } from "@/lib/routine";
import { addSlot, type FormState } from "../../actions";

export function SlotForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addSlot, {});
  return (
    <form action={action} className="flex flex-col gap-3 border-t border-base-300 pt-3">
      <input type="hidden" name="student_id" value={studentId} />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Día
          <select name="day" className="select select-sm w-full" defaultValue="1">
            {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Hora
          <input name="start_time" type="time" required defaultValue="07:00" className="input input-sm w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Duración (min)
          <input name="duration_min" type="number" min={15} max={240} step={15} defaultValue={60} className="input input-sm w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Nota
          <input name="notes" maxLength={200} placeholder="Opcional" className="input input-sm w-full" />
        </label>
      </div>
      {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
      <button disabled={pending} className="btn btn-outline btn-sm">{pending ? "Agregando…" : "Agregar horario"}</button>
    </form>
  );
}
