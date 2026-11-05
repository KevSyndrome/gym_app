"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { readImage } from "@/lib/images";

export type ProfileState = { error?: string; ok?: string };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const { supabase, profile } = await requireUser();
  const name = z.string().trim().min(1).max(120).safeParse(formData.get("full_name"));
  if (!name.success) return { error: "El nombre debe tener entre 1 y 120 caracteres." };

  let avatarPath = formData.get("remove_avatar") === "on" ? null : profile.avatar_path;
  const file = formData.get("avatar");
  let uploaded: string | null = null;
  if (file instanceof File && file.size > 0) {
    const image = await readImage(file);
    if ("error" in image) return { error: image.error };
    // La carpeta con el id del usuario es lo que exigen las políticas del bucket privado.
    uploaded = `${profile.id}/${crypto.randomUUID()}.${image.ext}`;
    const { error } = await supabase.storage.from("avatars").upload(uploaded, image.bytes, { contentType: image.type });
    if (error) return { error: "No se pudo subir la foto. Intenta de nuevo." };
    avatarPath = uploaded;
  }

  const { error } = await supabase.rpc("update_my_profile", {
    new_full_name: name.data,
    // null quita la foto; los tipos generados no reflejan que el parámetro acepta null.
    new_avatar_path: avatarPath as string,
  });
  if (error) {
    if (uploaded) await supabase.storage.from("avatars").remove([uploaded]);
    return { error: "No se pudo guardar el perfil. Intenta de nuevo." };
  }
  if (profile.avatar_path && profile.avatar_path !== avatarPath) {
    await supabase.storage.from("avatars").remove([profile.avatar_path]);
  }
  revalidatePath("/", "layout");
  return { ok: "Perfil guardado." };
}
