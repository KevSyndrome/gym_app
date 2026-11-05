import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { WorkoutLogger } from "@/components/workout-logger";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/routine";
import { MODE_LABELS, loggerData, type Mode } from "@/lib/workouts";

export default async function TrainerLogPage(props: PageProps<"/trainer/alumnos/[id]/registrar">) {
  const { supabase, profile } = await requireUser("trainer");
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: student } = await supabase.from("profiles").select("id, full_name, email, plan").eq("id", id).eq("role", "student").single();
  if (!student) notFound();
  const [data, skipReasons] = await Promise.all([
    loggerData(supabase, id, await props.searchParams),
    getCatalog(supabase, "skip_reasons"),
  ]);
  const modes: Mode[] = student.plan === "pro" ? ["with_trainer", "trainer_absent", "solo"] : ["solo"];

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <div>
          <Link href={`/trainer/alumnos/${id}`} className="link text-sm text-muted">{student.full_name || student.email}</Link>
          <h1 className="title mt-1">Registrar sesión</h1>
          <p className="mt-2 text-muted">Anota lo que hizo y cómo lo hizo.{data.routineName && ` Rutina: ${data.routineName}.`}</p>
        </div>
        <WorkoutLogger
          key={`${data.date}-${data.day}`}
          studentId={id}
          date={data.date}
          today={data.today}
          minDate={data.minDate}
          day={data.day}
          days={data.days}
          entries={data.entries}
          modes={modes.map((m) => ({ value: m, label: MODE_LABELS[m] }))}
          defaultMode={data.existing?.mode && modes.includes(data.existing.mode) ? data.existing.mode : modes[0]}
          defaultNotes={data.existing?.notes ?? ""}
          skipReasons={skipReasons}
          alreadyLogged={!!data.existing}
        />
      </main>
    </>
  );
}
