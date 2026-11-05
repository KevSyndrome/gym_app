import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "trainer" | "student";

// Autorización real en servidor; el proxy solo es la primera barrera.
export async function requireUser(role?: Role) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, plan")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (role && profile.role !== role) redirect("/panel");

  return { supabase, profile };
}
