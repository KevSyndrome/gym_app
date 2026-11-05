import { Header } from "@/components/header";
import { WorkoutHistory } from "@/components/workout-history";
import { requireUser } from "@/lib/auth";
import { getSessions } from "@/lib/workouts";

export default async function ProgressPage(props: PageProps<"/student/progreso">) {
  const { supabase, profile } = await requireUser("student");
  const { guardado } = await props.searchParams;
  const sessions = await getSessions(supabase, profile.id);

  return (
    <>
      <Header name={profile.full_name || profile.email} role="student" plan={profile.plan} current="/student/progreso" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="title">Tu progreso</h1>
          <p className="mt-2 text-muted">Tus últimas sesiones, con lo que hiciste frente a lo que pedía la rutina.</p>
        </div>
        {guardado && <p role="status" className="alert alert-success">Entrenamiento guardado.</p>}
        <WorkoutHistory
          sessions={sessions}
          highlight={typeof guardado === "string" ? guardado : undefined}
          editHref={(date) => `/student/registrar?fecha=${date}`}
          empty="Todavía no registras entrenamientos. Empieza con el de hoy."
        />
      </main>
    </>
  );
}
