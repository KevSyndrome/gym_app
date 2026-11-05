// Comparación plan contra lo hecho. Sin dependencias para poder probarla con node --test.

export type SetRow = {
  exercise_id: string;
  position: number;
  set_number: number;
  planned_reps: string | null;
  planned_weight_kg: number | null;
  reps: number | null;
  weight_kg: number | null;
  done: boolean;
  skip_reason: string | null;
  exercise: { name: string } | null;
};

const kg = (n: number | null) => (n == null ? "" : ` a ${String(n).replace(".", ",")} kg`);

/** Plan contra lo hecho de un ejercicio, en texto, y si cambió respecto al plan. */
export function summarize(sets: SetRow[]) {
  const first = sets[0];
  const plan = `${sets.length} × ${first.planned_reps ?? "?"}${kg(first.planned_weight_kg)}`;
  const done = sets.filter((s) => s.done);
  if (!done.length) {
    return { plan, done: `No lo hizo${first.skip_reason ? `: ${first.skip_reason.toLowerCase()}` : ""}`, changed: true };
  }
  const same = done.every((s) => s.reps === done[0].reps && s.weight_kg === done[0].weight_kg);
  const text = same
    ? `${done.length} × ${done[0].reps ?? "?"}${kg(done[0].weight_kg)}`
    : done.map((s) => `${s.reps ?? "?"}${s.weight_kg != null ? `×${String(s.weight_kg).replace(".", ",")}` : ""}`).join(", ") +
      (done.some((s) => s.weight_kg != null) ? " kg" : "");
  const plannedReps = Number(first.planned_reps);
  const changed =
    done.length !== sets.length ||
    done.some((s) => (Number.isFinite(plannedReps) && s.reps !== plannedReps) || (s.planned_weight_kg ?? null) !== (s.weight_kg ?? null));
  const skipped = sets.length - done.length;
  return { plan, done: skipped ? `${text} (${skipped} sin hacer)` : text, changed };
}
