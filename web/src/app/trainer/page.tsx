import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { InviteForm } from "./invite-form";

export default async function TrainerPage() {
  const { supabase, profile } = await requireUser("trainer");
  const { data: students } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan")
    .eq("role", "student")
    .order("full_name");

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" />
      <main className="mx-auto grid w-full max-w-5xl items-start gap-8 px-6 py-8 md:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-5 flex items-baseline gap-3">
            <h1 className="title">Alumnos</h1>
            <span className="text-muted">{students?.length ?? 0}</span>
          </div>
          {students?.length ? (
            <ul className="divide-y divide-base-300 rounded-lg border border-base-300">
              {students.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.full_name || "Sin nombre"}</p>
                    <p className="truncate text-sm text-muted">{s.email}</p>
                  </div>
                  <span
                    className={`badge shrink-0 ${s.plan === "pro" ? "badge-primary" : "badge-outline text-muted"}`}
                  >
                    {s.plan === "pro" ? "Pro" : "Free"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-base-300 px-6 py-10 text-center">
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
