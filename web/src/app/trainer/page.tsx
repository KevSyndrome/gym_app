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
      <Header name={profile.full_name || profile.email} />
      <main className="mx-auto grid w-full max-w-4xl gap-6 p-6 md:grid-cols-[1fr_20rem]">
        <section>
          <h1 className="mb-4 text-2xl font-bold">Alumnos</h1>
          {students?.length ? (
            <ul className="divide-y rounded border">
              {students.map((s) => (
                <li key={s.id} className="flex justify-between p-3">
                  <span>
                    {s.full_name || "(sin nombre)"} <span className="text-sm opacity-70">{s.email}</span>
                  </span>
                  <span className="text-sm uppercase">{s.plan}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aún no tienes alumnos. Invita al primero.</p>
          )}
        </section>
        <InviteForm />
      </main>
    </>
  );
}
