import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

export const CATALOGS = {
  muscle_groups: "Grupos musculares",
  equipment: "Equipo",
  skip_reasons: "Motivos para no hacer un ejercicio",
} as const;
export type CatalogTable = keyof typeof CATALOGS;

export async function getCatalog(supabase: SupabaseClient<Database>, table: CatalogTable) {
  const { data } = await supabase.from(table).select("name").order("position").order("name");
  return (data ?? []).map((r) => r.name);
}

export type RoutineItem = {
  id: string;
  day: number;
  position: number;
  sets: number;
  reps: string;
  weight_kg: number | null;
  rest_seconds: number | null;
  notes: string;
  exercise: { id: string; name: string; description: string; image_path: string | null; muscle_group: string };
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  student_id: string | null;
  routine_items: RoutineItem[];
};

const SELECT =
  "id, name, description, student_id, routine_items(id, day, position, sets, reps, weight_kg, rest_seconds, notes, exercise:exercises(id, name, description, image_path, muscle_group))";

// RLS decide qué rutinas devuelve; aquí solo se arma la forma.
export async function getRoutines(supabase: SupabaseClient<Database>, filter: { id?: string; studentId?: string; templates?: boolean }) {
  let q = supabase.from("routines").select(SELECT).order("name");
  if (filter.id) q = q.eq("id", filter.id);
  if (filter.studentId) q = q.eq("student_id", filter.studentId);
  if (filter.templates) q = q.is("student_id", null);
  const { data, error } = await q.returns<Routine[]>();
  if (error) throw error;
  return data;
}

export function byDay(items: RoutineItem[]) {
  const days = new Map<number, RoutineItem[]>();
  for (const item of [...items].sort((a, b) => a.day - b.day || a.position - b.position)) {
    days.set(item.day, [...(days.get(item.day) ?? []), item]);
  }
  return days;
}

export function imageUrl(path: string | null) {
  return path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/exercise-images/${path}` : null;
}

export function describeItem(item: Pick<RoutineItem, "sets" | "reps" | "weight_kg">) {
  return `${item.sets} × ${item.reps}${item.weight_kg != null ? ` a ${String(item.weight_kg).replace(".", ",")} kg` : ""}`;
}
