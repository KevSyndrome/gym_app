"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

const inviteSchema = z.object({
  email: z.email().max(254),
  full_name: z.string().trim().min(1).max(120),
});

export type InviteState = { error?: string; ok?: string; link?: string };

export async function inviteStudent(_prev: InviteState, formData: FormData): Promise<InviteState> {
  // Las server actions son endpoints públicos: se verifica el rol aquí, no solo en la página.
  const { supabase } = await requireUser("trainer");

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
  });
  if (!parsed.success) return { error: "Revisa el nombre y el correo." };
  const { email, full_name } = parsed.data;

  // Next ya valida que Origin coincida con el host en server actions; Supabase además lo exige en su lista de redirecciones.
  const origin = (await headers()).get("origin");
  // shortcut: genera el enlace sin enviar correo; el entrenador lo comparte a mano. Con SMTP propio, enviarlo además.
  const { data, error } = await createAdminClient().auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${origin}/auth/accept` },
  });
  if (error) {
    return { error: error.code === "email_exists" ? "Ese correo ya tiene cuenta." : "No se pudo crear la invitación. Intenta de nuevo." };
  }

  // Con el cliente del entrenador: la política RLS es la que autoriza el cambio.
  await supabase.from("profiles").update({ full_name }).eq("id", data.user.id);
  revalidatePath("/trainer");
  return { ok: `Invitación lista para ${full_name}. Mándale este enlace; vence en 1 hora.`, link: data.properties.action_link };
}
