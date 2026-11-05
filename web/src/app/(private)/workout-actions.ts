"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { isISODate, todayISO } from "@/lib/dates";

export type SaveState = { error?: string };

const num = (max: number, int = false) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : Number(String(v).replace(",", "."))),
    (int ? z.number().int() : z.number()).min(0).max(max).nullable(),
  );

const payloadSchema = z.object({
  student_id: z.uuid().optional(),
  date: z.string().refine(isISODate),
  mode: z.enum(["with_trainer", "trainer_absent", "solo"]),
  routine_day: z.number().int().min(1).max(7).nullable(),
  notes: z.string().trim().max(1000),
  entries: z.array(z.object({
    exercise_id: z.uuid(),
    position: z.number().int().min(0).max(100),
    planned_reps: z.string().max(20).nullable(),
    planned_weight_kg: z.number().min(0).max(999).nullable(),
    skipped: z.boolean(),
    skip_reason: z.string().trim().max(200),
    sets: z.array(z.object({ reps: num(500, true), weight_kg: num(999), done: z.boolean() })).max(20),
  })).max(30),
});

export async function saveWorkout(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const { supabase, profile } = await requireUser();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload")));
  } catch {
    return { error: "Datos no válidos. Recarga la página e intenta de nuevo." };
  }
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return { error: "Revisa los números: repeticiones de 0 a 500 y peso de 0 a 999 kg." };
  const p = parsed.data;
  if (p.date > todayISO()) return { error: "No se puede registrar una fecha futura." };

  // El alumno solo registra lo suyo; el entrenador indica de qué alumno es. La RLS lo vuelve a verificar.
  const trainer = profile.role === "trainer";
  const studentId = trainer ? p.student_id : profile.id;
  if (!studentId) return { error: "Falta el alumno." };

  const sets = p.entries.flatMap((e) => {
    const rows = e.skipped || !e.sets.length ? [{ reps: null, weight_kg: null, done: false }] : e.sets;
    return rows.map((s, i) => ({
      exercise_id: e.exercise_id,
      position: e.position,
      set_number: i + 1,
      planned_reps: e.planned_reps,
      planned_weight_kg: e.planned_weight_kg,
      reps: e.skipped ? null : s.reps,
      weight_kg: e.skipped ? null : s.weight_kg,
      done: !e.skipped && s.done,
      skip_reason: e.skipped || !s.done ? e.skip_reason || null : null,
    }));
  });

  const { error } = await supabase.rpc("save_workout", {
    p_student: studentId,
    p_date: p.date,
    p_mode: p.mode,
    p_routine_day: p.routine_day as number,
    p_notes: p.notes,
    p_sets: sets,
  });
  if (error) {
    return {
      error: error.code === "22023" ? "En el plan gratuito se entrena sin entrenador."
        : error.code === "42501" ? "No tienes permiso para registrar esta sesión."
        : "No se pudo guardar. Intenta de nuevo.",
    };
  }
  const target = trainer ? `/trainer/alumnos/${studentId}` : "/student/progreso";
  revalidatePath(target);
  redirect(`${target}?guardado=${p.date}`);
}
