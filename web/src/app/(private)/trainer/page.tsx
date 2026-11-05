import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { avatarUrls } from "@/lib/avatars";
import { AccessLinkButton } from "./access-link-button";
import { setPlan } from "./actions";
import { InviteForm } from "./invite-form";

export default async function TrainerPage() {
  const { supabase, profile } = await requireUser("trainer");
  const { data: students } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, avatar_path, routines(id, name)")
    .eq("role", "student")
    .order("full_name");
  const avatars = await avatarUrls(supabase, students?.map((s) => s.avatar_path) ?? []);

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer" />
      <main className="mx-auto grid w-full max-w-5xl items-start gap-8 px-6 py-8 md:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-5 flex items-baseline gap-3">
            <h1 className="title">Alumnos</h1>
            <span className="text-muted">{students?.length ?? 0}</span>
          </div>
          {students?.length ? (
            <ul className="divide-y divide-base-300 rounded-box border border-base-300">
              {students.map((s) => {
                const routine = s.routines[0];
                return (
                  <li key={s.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                    <Avatar name={s.full_name || s.email} url={avatars.get(s.avatar_path ?? "")} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.full_name || "Sin nombre"}</p>
                      <p className="truncate text-sm text-muted">{s.email}</p>
                      <p className="mt-1 text-sm">
                        {routine ? (
                          <Link href={`/trainer/routines/${routine.id}`} className="link link-primary">
                            {routine.name}
                          </Link>
                        ) : s.plan === "pro" ? (
                          <Link href={`/trainer/routines?alumno=${s.id}`} className="link link-primary">
                            Armar su rutina
                          </Link>
                        ) : (
                          <span className="text-muted">Aún no elige rutina</span>
                        )}
                      </p>
                      <AccessLinkButton studentId={s.id} />
                    </div>
                    </div>
                    <form action={setPlan} className="flex shrink-0 items-center gap-2">
                      <input type="hidden" name="student_id" value={s.id} />
                      <input type="hidden" name="plan" value={s.plan === "pro" ? "free" : "pro"} />
                      <span className={`badge ${s.plan === "pro" ? "badge-primary" : "badge-outline text-muted"}`}>
                        {s.plan === "pro" ? "Pro" : "Free"}
                      </span>
                      <button className="btn btn-ghost btn-xs">{s.plan === "pro" ? "Pasar a Free" : "Pasar a Pro"}</button>
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
              <p className="font-medium">Todavía no tienes alumnos.</p>
              <p className="mt-1 text-sm text-muted">Crea un enlace de invitación y mándaselo por WhatsApp o correo.</p>
            </div>
          )}
        </section>
        <InviteForm />
      </main>
    </>
  );
}
