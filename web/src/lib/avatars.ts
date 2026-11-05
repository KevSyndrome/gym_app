import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Bucket privado: URLs firmadas de corta vida; RLS decide de quién puede firmar.
export async function avatarUrls(supabase: SupabaseClient<Database>, paths: (string | null)[]) {
  const wanted = paths.filter((p): p is string => !!p);
  if (!wanted.length) return new Map<string, string>();
  const { data } = await supabase.storage.from("avatars").createSignedUrls(wanted, 60 * 60);
  return new Map((data ?? []).flatMap((d) => (d.signedUrl && d.path ? [[d.path, d.signedUrl] as const] : [])));
}
