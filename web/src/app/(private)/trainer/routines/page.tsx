import Link from "next/link";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { RoutineForm } from "./routine-form";

export default async function RoutinesPage(props: PageProps<"/trainer/routines">) {
  const { supabase, profile } = await requireUser("trainer");
  const { alumno } = await props.searchParams;
  const [{ data: routines }, { data: students }] = await Promise.all([
    supabase.from("routines").select("id, name, student_id, student:profiles(full_name, email), routine_items(count)").order("name"),
    supabase.from("profiles").select("id, full_name, email, routines(id)").eq("role", "student").order("full_name"),
  ]);
  const templates = routines?.filter((r) => !r.student_id) ?? [];
  const personal = routines?.filter((r) => r.student_id) ?? [];
  const withoutRoutine = students?.filter((s) => !s.routines.length) ?? [];

  const list = (items: typeof templates, empty: string) =>
    items.length ? (
      <ul className="divide-y divide-base-300 rounded-box border border-base-300">
        {items.map((r) => (
          <li key={r.id}>
            <Link href={`/trainer/routines/${r.id}`} className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-base-200">
              <span>
                <span className="font-medium">{r.name}</span>
                {r.student && <span className="block text-sm text-muted">{r.student.full_name || r.student.email}</span>}
              </span>
              <span className="shrink-0 text-sm text-muted">{r.routine_items[0]?.count ?? 0} ejercicios</span>
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="rounded-box border border-dashed border-base-300 p-6 text-center text-sm text-muted">{empty}</p>
    );

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer/routines" />
      <main className="mx-auto grid w-full max-w-5xl items-start gap-8 px-6 py-8 md:grid-cols-[1fr_22rem]">
        <section className="flex flex-col gap-8">
          <h1 className="title">Rutinas</h1>
          <section>
            <h2 className="font-display text-2xl font-bold">Personalizadas</h2>
            <p className="mb-3 text-sm text-muted">Una por alumno. Si la cambias, el alumno lo ve al instante.</p>
            {list(personal, "Ningún alumno tiene rutina todavía.")}
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold">Plantillas del plan Free</h2>
            <p className="mb-3 text-sm text-muted">Los alumnos Free eligen una de estas y la siguen por su cuenta.</p>
            {list(templates, "No hay plantillas. Crea una para que los alumnos Free puedan elegir.")}
          </section>
        </section>
        <RoutineForm students={withoutRoutine.map((s) => ({ id: s.id, name: s.full_name || s.email }))} preselected={typeof alumno === "string" ? alumno : undefined} />
      </main>
    </>
  );
}
