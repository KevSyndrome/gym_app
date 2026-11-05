import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type Role = "trainer" | "student";

// Autorización real en servidor; el proxy solo es la primera barrera.
export async function requireUser(role?: Role) {
  // Páginas privadas = siempre por petición; sin esto Next intenta prerenderizar y Supabase usa Date.now().
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, plan, avatar_path")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (role && profile.role !== role) redirect("/panel");

  return { supabase, profile };
}
