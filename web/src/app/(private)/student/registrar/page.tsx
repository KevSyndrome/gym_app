import { Header } from "@/components/header";
import { WorkoutLogger } from "@/components/workout-logger";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/routine";
import { MODES, loggerData, type Mode } from "@/lib/workouts";

export default async function LogPage(props: PageProps<"/student/registrar">) {
  const { supabase, profile } = await requireUser("student");
  const [data, skipReasons] = await Promise.all([
    loggerData(supabase, profile.id, await props.searchParams),
    getCatalog(supabase, "skip_reasons"),
  ]);
  // Gratuito: siempre sin entrenador. Pro: elige si su entrenador no llegó, si entrena solo o con él.
  const modes: Mode[] = profile.plan === "pro" ? ["trainer_absent", "solo", "with_trainer"] : ["solo"];

  return (
    <>
      <Header name={profile.full_name || profile.email} role="student" plan={profile.plan} current="/student/registrar" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="title">Registrar entrenamiento</h1>
          <p className="mt-2 text-muted">
            Anota lo que de verdad hiciste. Si no lo anotaste el día que tocaba, cambia la fecha.
            {data.routineName && ` Rutina: ${data.routineName}.`}
          </p>
        </div>
        <WorkoutLogger
          key={`${data.date}-${data.day}`}
          date={data.date}
          today={data.today}
          minDate={data.minDate}
          day={data.day}
          days={data.days}
          entries={data.entries}
          modes={modes.map((m) => ({ value: m, label: MODES[m] }))}
          defaultMode={data.existing?.mode && modes.includes(data.existing.mode) ? data.existing.mode : modes[0]}
          defaultNotes={data.existing?.notes ?? ""}
          skipReasons={skipReasons}
          alreadyLogged={!!data.existing}
        />
      </main>
    </>
  );
}
