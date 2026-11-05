"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { readImage } from "@/lib/images";
import { createAdminClient } from "@/lib/supabase/server";

// Las server actions son endpoints públicos: cada una verifica el rol y valida su entrada.

export type FormState = { error?: string; ok?: string; link?: string };

const id = z.uuid();
const text = (max: number) => z.string().trim().max(max);
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((v) => (v === "" || v == null ? null : Number(String(v).replace(",", "."))), schema.nullable());

async function invitationRedirect() {
  // Next valida que Origin coincida con el host en server actions; Supabase además lo exige en su lista de redirecciones.
  return `${(await headers()).get("origin")}/auth/accept`;
}

const inviteSchema = z.object({ email: z.email().max(254), full_name: text(120).min(1) });

export async function inviteStudent(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const parsed = inviteSchema.safeParse({ email: formData.get("email"), full_name: formData.get("full_name") });
  if (!parsed.success) return { error: "Revisa el nombre y el correo." };
  const { email, full_name } = parsed.data;

  // shortcut: genera el enlace sin enviar correo; el entrenador lo comparte a mano. Con SMTP propio, enviarlo además.
  const { data, error } = await createAdminClient().auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: await invitationRedirect() },
  });
  if (error) {
    return {
      error: error.code === "email_exists"
        ? "Ese correo ya tiene cuenta. Usa \"Nuevo enlace\" en su fila."
        : "No se pudo crear la invitación. Intenta de nuevo.",
    };
  }

  // Con el cliente del entrenador: la política RLS es la que autoriza el cambio.
  await supabase.from("profiles").update({ full_name }).eq("id", data.user.id);
  revalidatePath("/trainer");
  return { ok: `Invitación lista para ${full_name}. Mándale este enlace; vence en 1 hora.`, link: data.properties.action_link };
}

export async function newAccessLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const studentId = id.safeParse(formData.get("student_id"));
  if (!studentId.success) return { error: "Alumno no válido." };

  const { data: student } = await supabase
    .from("profiles").select("email").eq("id", studentId.data).eq("role", "student").single();
  if (!student) return { error: "Alumno no encontrado." };

  // Enlace de un solo uso: entra y vuelve a elegir contraseña (sirve si perdió la invitación o la olvidó).
  const { data, error } = await createAdminClient().auth.admin.generateLink({
    type: "magiclink",
    email: student.email,
    options: { redirectTo: await invitationRedirect() },
  });
  if (error) return { error: "No se pudo crear el enlace. Intenta de nuevo." };
  return { ok: "Enlace nuevo listo; vence en 1 hora.", link: data.properties.action_link };
}

export async function setPlan(formData: FormData) {
  const { supabase } = await requireUser("trainer");
  const parsed = z.object({ student_id: id, plan: z.enum(["free", "pro"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  // shortcut: el entrenador activa Pro a mano; con Stripe (fase 5) lo hará el pago.
  await supabase.from("profiles").update({ plan: parsed.data.plan }).eq("id", parsed.data.student_id).eq("role", "student");
  revalidatePath("/trainer", "layout");
}


// Grupo y equipo los valida la base (llaves foráneas a los catálogos).
const exerciseSchema = z.object({
  name: text(80).min(1),
  muscle_group: text(40).min(1),
  equipment: text(40).transform((v) => v || null),
  description: text(2000),
});

export async function createExercise(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    muscle_group: formData.get("muscle_group"),
    equipment: formData.get("equipment") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: "Revisa el nombre y el grupo muscular." };

  let image_path: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const image = await readImage(file);
    if ("error" in image) return { error: image.error };
    image_path = `${crypto.randomUUID()}.${image.ext}`;
    const { error } = await supabase.storage.from("exercise-images").upload(image_path, image.bytes, { contentType: image.type });
    if (error) return { error: "No se pudo subir la imagen. Intenta de nuevo." };
  }

  const { error } = await supabase.from("exercises").insert({ ...parsed.data, image_path });
  if (error) {
    if (image_path) await supabase.storage.from("exercise-images").remove([image_path]);
    return {
      error: error.code === "23505" ? "Ya existe un ejercicio con ese nombre."
        : error.code === "23503" ? "Ese grupo muscular o equipo ya no existe en el catálogo."
        : "No se pudo guardar el ejercicio.",
    };
  }
  revalidatePath("/trainer/exercises");
  return { ok: `${parsed.data.name} agregado al catálogo.` };
}

export async function deleteExercise(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const exerciseId = id.safeParse(formData.get("exercise_id"));
  if (!exerciseId.success) return { error: "Ejercicio no válido." };

  const { data, error } = await supabase.from("exercises").delete().eq("id", exerciseId.data).select("image_path").single();
  if (error) {
    return { error: error.code === "23503" ? "Está en una rutina: quítalo de ahí antes de borrarlo." : "No se pudo borrar." };
  }
  if (data.image_path) await supabase.storage.from("exercise-images").remove([data.image_path]);
  revalidatePath("/trainer/exercises");
  return {};
}

const routineSchema = z.object({
  name: text(80).min(1),
  description: text(1000),
  student_id: z.union([z.literal("template"), id]),
});

export async function createRoutine(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const parsed = routineSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    student_id: formData.get("student_id"),
  });
  if (!parsed.success) return { error: "Revisa el nombre y para quién es la rutina." };
  const { student_id, ...rest } = parsed.data;

  const { data, error } = await supabase
    .from("routines")
    .insert({ ...rest, student_id: student_id === "template" ? null : student_id })
    .select("id")
    .single();
  if (error) {
    return { error: error.code === "23505" ? "Ese alumno ya tiene rutina: edítala en vez de crear otra." : "No se pudo crear la rutina." };
  }
  redirect(`/trainer/routines/${data.id}`);
}

export async function deleteRoutine(formData: FormData) {
  const { supabase } = await requireUser("trainer");
  const routineId = id.safeParse(formData.get("routine_id"));
  if (routineId.success) await supabase.from("routines").delete().eq("id", routineId.data);
  redirect("/trainer/routines");
}

const itemSchema = z.object({
  routine_id: id,
  exercise_id: id,
  day: z.coerce.number().int().min(1).max(7),
  sets: z.coerce.number().int().min(1).max(20),
  reps: text(20).min(1),
  weight_kg: optionalNumber(z.number().min(0).max(999)),
  rest_seconds: optionalNumber(z.number().int().min(0).max(900)),
  notes: text(500),
});

export async function addItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const parsed = itemSchema.safeParse({ ...Object.fromEntries(formData), notes: formData.get("notes") ?? "" });
  if (!parsed.success) return { error: "Revisa los datos: series de 1 a 20, peso de 0 a 999 kg y descanso de 0 a 900 s." };

  // Se agrega al final del día elegido.
  const { count } = await supabase
    .from("routine_items")
    .select("id", { count: "exact", head: true })
    .eq("routine_id", parsed.data.routine_id)
    .eq("day", parsed.data.day);
  const { error } = await supabase.from("routine_items").insert({ ...parsed.data, position: count ?? 0 });
  if (error) return { error: "No se pudo agregar el ejercicio." };
  revalidatePath(`/trainer/routines/${parsed.data.routine_id}`);
  return { ok: "Ejercicio agregado." };
}

export async function deleteItem(formData: FormData) {
  const { supabase } = await requireUser("trainer");
  const parsed = z.object({ item_id: id, routine_id: id }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await supabase.from("routine_items").delete().eq("id", parsed.data.item_id);
  revalidatePath(`/trainer/routines/${parsed.data.routine_id}`);
}

const slotSchema = z.object({
  student_id: id,
  day: z.coerce.number().int().min(1).max(7),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration_min: z.coerce.number().int().min(15).max(240),
  notes: text(200),
});

export async function addSlot(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const parsed = slotSchema.safeParse({ ...Object.fromEntries(formData), notes: formData.get("notes") ?? "" });
  if (!parsed.success) return { error: "Revisa el día, la hora y la duración (15 a 240 minutos)." };
  const { error } = await supabase.from("training_slots").insert(parsed.data);
  if (error) return { error: "No se pudo guardar el horario." };
  revalidatePath(`/trainer/alumnos/${parsed.data.student_id}`);
  return { ok: "Horario agregado." };
}

export async function deleteSlot(formData: FormData) {
  const { supabase } = await requireUser("trainer");
  const parsed = z.object({ slot_id: id, student_id: id }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await supabase.from("training_slots").delete().eq("id", parsed.data.slot_id);
  revalidatePath(`/trainer/alumnos/${parsed.data.student_id}`);
}

const catalogTable = z.enum(["muscle_groups", "equipment", "skip_reasons"]);

export async function addCatalogItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const parsed = z.object({ table: catalogTable, name: text(80).min(1) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Escribe un nombre." };
  const { table, name } = parsed.data;
  const value = table === "skip_reasons" ? name : name.toLowerCase();
  const { error } = await supabase.from(table).insert({ name: value, position: 100 });
  if (error) return { error: error.code === "23505" ? "Ya existe." : error.code === "23514" ? "Nombre demasiado largo." : "No se pudo agregar." };
  revalidatePath("/trainer/catalogos");
  return { ok: `"${value}" agregado.` };
}

export async function deleteCatalogItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser("trainer");
  const parsed = z.object({ table: catalogTable, name: text(80).min(1) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "No válido." };
  const { error } = await supabase.from(parsed.data.table).delete().eq("name", parsed.data.name);
  if (error) return { error: error.code === "23503" ? "Hay ejercicios que lo usan: cámbialos primero." : "No se pudo borrar." };
  revalidatePath("/trainer/catalogos");
  return {};
}
