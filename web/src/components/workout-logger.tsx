"use client";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { saveWorkout, type SaveState } from "@/app/(private)/workout-actions";
import { DAYS } from "@/lib/routine";
import type { LoggerEntry, Mode } from "@/lib/workouts";

type Props = {
  studentId?: string;
  date: string;
  today: string;
  minDate: string;
  day: number | null;
  days: number[];
  entries: LoggerEntry[];
  modes: { value: Mode; label: string }[];
  defaultMode: Mode;
  defaultNotes: string;
  skipReasons: string[];
  alreadyLogged: boolean;
};

export function WorkoutLogger(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [entries, setEntries] = useState(props.entries);
  const [mode, setMode] = useState<Mode>(props.defaultMode);
  const [notes, setNotes] = useState(props.defaultNotes);
  const [state, action, pending] = useActionState<SaveState, FormData>(saveWorkout, {});

  const go = (fecha: string, dia?: number | null) =>
    router.push(`${pathname}?fecha=${fecha}${dia ? `&dia=${dia}` : ""}`);

  const update = (i: number, change: (e: LoggerEntry) => LoggerEntry) =>
    setEntries((list) => list.map((e, j) => (j === i ? change(e) : e)));
  const updateSet = (i: number, s: number, change: Partial<LoggerEntry["sets"][number]>) =>
    update(i, (e) => ({ ...e, sets: e.sets.map((x, k) => (k === s ? { ...x, ...change } : x)) }));

  const payload = JSON.stringify({
    student_id: props.studentId,
    date: props.date,
    mode,
    routine_day: props.day,
    notes,
    entries,
  });

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="payload" value={payload} />

      <section className="grid gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Fecha
          <input
            type="date"
            className="input w-full"
            value={props.date}
            min={props.minDate}
            max={props.today}
            onChange={(e) => e.target.value && go(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Rutina del día
          <select className="select w-full" value={props.day ?? ""} onChange={(e) => go(props.date, Number(e.target.value))} disabled={!props.days.length}>
            {props.days.map((d) => (
              <option key={d} value={d}>{DAYS[d - 1]}</option>
            ))}
          </select>
        </label>
        {props.modes.length > 1 && (
          <fieldset className="flex flex-col gap-2 sm:col-span-2">
            <legend className="mb-1 text-sm text-muted">¿Cómo entrenaste?</legend>
            <div className="flex flex-wrap gap-2">
              {props.modes.map((m) => (
                <label key={m.value} className={`btn btn-sm ${mode === m.value ? "btn-primary" : "btn-outline"}`}>
                  <input type="radio" name="mode_choice" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} className="sr-only" />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {props.alreadyLogged && (
          <p className="text-sm text-primary sm:col-span-2">Este día ya tiene registro: al guardar se reemplaza.</p>
        )}
      </section>

      {!entries.length && (
        <p className="rounded-box border border-dashed border-base-300 p-6 text-center text-muted">
          No hay ejercicios para registrar. {props.days.length ? "Elige otro día de la rutina." : "Primero necesitas una rutina."}
        </p>
      )}

      {entries.map((e, i) => (
        <section key={e.exercise_id} className="rounded-box border border-base-300 bg-base-200">
          <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-base-300 px-4 py-3">
            <h3 className="font-display text-2xl font-bold">{e.name}</h3>
            <span className="text-sm text-muted">
              Plan: {e.sets.length || "?"} × {e.planned_reps ?? "?"}
              {e.planned_weight_kg != null && ` a ${String(e.planned_weight_kg).replace(".", ",")} kg`}
            </span>
          </header>
          <div className="flex flex-col gap-3 p-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="toggle toggle-sm" checked={e.skipped} onChange={(ev) => update(i, (x) => ({ ...x, skipped: ev.target.checked }))} />
              No lo hice
            </label>
            {e.skipped ? (
              <ReasonSelect reasons={props.skipReasons} value={e.skip_reason} onChange={(v) => update(i, (x) => ({ ...x, skip_reason: v }))} />
            ) : (
              <>
                <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem] items-center gap-2 text-sm text-muted">
                  <span>Serie</span><span>Reps</span><span>Peso (kg)</span><span className="text-center">Hecha</span>
                </div>
                {e.sets.map((s, k) => (
                  <div key={k} className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem] items-center gap-2">
                    <span className="font-display text-xl">{k + 1}</span>
                    <input aria-label={`Repeticiones serie ${k + 1}`} inputMode="numeric" className="input input-sm w-full" value={s.reps} onChange={(ev) => updateSet(i, k, { reps: ev.target.value })} />
                    <input aria-label={`Peso serie ${k + 1}`} inputMode="decimal" className="input input-sm w-full" value={s.weight_kg} onChange={(ev) => updateSet(i, k, { weight_kg: ev.target.value })} />
                    <input aria-label={`Serie ${k + 1} hecha`} type="checkbox" className="checkbox checkbox-primary mx-auto" checked={s.done} onChange={(ev) => updateSet(i, k, { done: ev.target.checked })} />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost btn-xs" disabled={e.sets.length >= 20}
                    onClick={() => update(i, (x) => ({ ...x, sets: [...x.sets, x.sets.at(-1) ?? { reps: "", weight_kg: "", done: true }] }))}>
                    Agregar serie
                  </button>
                  <button type="button" className="btn btn-ghost btn-xs" disabled={e.sets.length <= 1}
                    onClick={() => update(i, (x) => ({ ...x, sets: x.sets.slice(0, -1) }))}>
                    Quitar serie
                  </button>
                </div>
                {e.sets.some((s) => !s.done) && (
                  <ReasonSelect reasons={props.skipReasons} value={e.skip_reason} onChange={(v) => update(i, (x) => ({ ...x, skip_reason: v }))} label="¿Por qué no completaste todas?" />
                )}
              </>
            )}
          </div>
        </section>
      ))}

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Notas de la sesión
        <textarea className="textarea w-full" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cómo te sentiste, qué costó más…" />
      </label>
      {state.error && <p role="alert" className="text-error">{state.error}</p>}
      <button disabled={pending || !entries.length} className="btn btn-primary btn-lg">{pending ? "Guardando…" : "Guardar entrenamiento"}</button>
    </form>
  );
}

function ReasonSelect({ reasons, value, onChange, label = "Motivo" }: { reasons: string[]; value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-muted">
      {label}
      <select className="select select-sm w-full" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Sin especificar</option>
        {reasons.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </label>
  );
}
