"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

const inviteSchema = z.object({
  email: z.email().max(254),
  full_name: z.string().trim().min(1).max(120),
});

export type InviteState = { error?: string; ok?: string };

export async function inviteStudent(_prev: InviteState, formData: FormData): Promise<InviteState> {
  // Las server actions son endpoints públicos: se verifica el rol aquí, no solo en la página.
  const { supabase } = await requireUser("trainer");

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
  });
  if (!parsed.success) return { error: "Revisa el nombre y el correo." };
  const { email, full_name } = parsed.data;

  const { data, error } = await createAdminClient().auth.admin.inviteUserByEmail(email);
  if (error) {
    return { error: error.code === "email_exists" ? "Ese correo ya está registrado." : "No se pudo enviar la invitación." };
  }

  // Con el cliente del entrenador: la política RLS es la que autoriza el cambio.
  await supabase.from("profiles").update({ full_name }).eq("id", data.user.id);
  revalidatePath("/trainer");
  return { ok: `Invitación enviada a ${email}.` };
}
