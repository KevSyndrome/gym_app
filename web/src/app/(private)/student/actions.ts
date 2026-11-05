"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

export async function chooseTemplate(formData: FormData) {
  const { supabase } = await requireUser("student");
  const templateId = z.uuid().safeParse(formData.get("template_id"));
  if (!templateId.success) return;
  // La función en la base verifica que sea alumno Free y que sea una plantilla.
  const { error } = await supabase.rpc("choose_template", { template_id: templateId.data });
  redirect(error ? "/student/plantillas?error=1" : "/student");
}
