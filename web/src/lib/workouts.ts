import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { addDays, isISODate, todayISO, weekdayOf } from "@/lib/dates";
import { byDay, getRoutines } from "@/lib/routine";
import type { SetRow } from "@/lib/summary";

export { summarize, type SetRow } from "@/lib/summary";

export const MODES = {
  with_trainer: "Con mi entrenador",
  trainer_absent: "Mi entrenador no llegó",
  solo: "Sin entrenador hoy",
} as const;
export type Mode = keyof typeof MODES;

/** Cómo se muestra el modo en el historial (en tercera persona). */
export const MODE_LABELS: Record<Mode, string> = {
  with_trainer: "Con entrenador",
  trainer_absent: "El entrenador no llegó",
  solo: "Sin entrenador",
};

export type Session = {
  id: string;
  date: string;
  mode: Mode;
  notes: string;
  routine_day: number | null;
  logged_by: string | null;
  student_id: string;
  set_logs: SetRow[];
};

const SELECT =
  "id, date, mode, notes, routine_day, logged_by, student_id, set_logs(exercise_id, position, set_number, planned_reps, planned_weight_kg, reps, weight_kg, done, skip_reason, exercise:exercises(name))";

export async function getSessions(supabase: SupabaseClient<Database>, studentId: string, opts: { date?: string; limit?: number } = {}) {
  let q = supabase.from("workout_sessions").select(SELECT).eq("student_id", studentId).order("date", { ascending: false });
  if (opts.date) q = q.eq("date", opts.date);
  const { data, error } = await q.limit(opts.limit ?? 30).returns<Session[]>();
  if (error) throw error;
  return data;
}

/** Agrupa las series por ejercicio, en el orden de la rutina. */
export function groupByExercise(sets: SetRow[]) {
  const groups = new Map<string, { exerciseId: string; name: string; position: number; sets: SetRow[] }>();
  for (const s of [...sets].sort((a, b) => a.position - b.position || a.set_number - b.set_number)) {
    const g = groups.get(s.exercise_id) ?? { exerciseId: s.exercise_id, name: s.exercise?.name ?? "Ejercicio", position: s.position, sets: [] };
    g.sets.push(s);
    groups.set(s.exercise_id, g);
  }
  return [...groups.values()];
}

export type LoggerEntry = {
  exercise_id: string;
  name: string;
  position: number;
  planned_reps: string | null;
  planned_weight_kg: number | null;
  skipped: boolean;
  skip_reason: string;
  sets: { reps: string; weight_kg: string; done: boolean }[];
};

/** Arma lo que necesita el formulario de registro para un alumno y una fecha. */
export async function loggerData(supabase: SupabaseClient<Database>, studentId: string, params: { fecha?: string | string[]; dia?: string | string[] }) {
  const today = todayISO();
  const date = isISODate(params.fecha) && params.fecha <= today ? params.fecha : today;
  const [[routine], [existing]] = await Promise.all([
    getRoutines(supabase, { studentId }),
    getSessions(supabase, studentId, { date }),
  ]);
  const days = byDay(routine?.routine_items ?? []);
  const requested = Number(params.dia);
  const day = days.has(requested) ? requested : existing?.routine_day && days.has(existing.routine_day) ? existing.routine_day
    : days.has(weekdayOf(date)) ? weekdayOf(date) : [...days.keys()][0] ?? null;

  const logged = new Map(groupByExercise(existing?.set_logs ?? []).map((g) => [g.exerciseId, g]));
  const firstNumber = (reps: string | null) => reps?.match(/\d+/)?.[0] ?? "";
  // Si ya registró ese día con esa rutina, se precarga lo que anotó; si no, el plan.
  const entries: LoggerEntry[] = (day ? days.get(day)! : []).map((item) => {
    const prev = existing?.routine_day === day ? logged.get(item.exercise.id) : undefined;
    const skipped = !!prev && prev.sets.every((s) => !s.done);
    return {
      exercise_id: item.exercise.id,
      name: item.exercise.name,
      position: item.position,
      planned_reps: item.reps,
      planned_weight_kg: item.weight_kg,
      skipped,
      skip_reason: prev?.sets[0]?.skip_reason ?? "",
      sets: prev && !skipped
        ? prev.sets.map((s) => ({ reps: s.reps?.toString() ?? "", weight_kg: s.weight_kg?.toString() ?? "", done: s.done }))
        : Array.from({ length: item.sets }, () => ({ reps: firstNumber(item.reps), weight_kg: item.weight_kg?.toString() ?? "", done: true })),
    };
  });

  return {
    date,
    today,
    minDate: addDays(today, -60),
    day,
    days: [...days.keys()],
    routineName: routine?.name ?? null,
    entries,
    existing: existing ? { mode: existing.mode, notes: existing.notes } : null,
  };
}
