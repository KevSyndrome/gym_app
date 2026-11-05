import Link from "next/link";
import { Header } from "@/components/header";
import { RoutineWeek } from "@/components/routine-week";
import { requireUser } from "@/lib/auth";
import { getRoutines } from "@/lib/routine";

export default async function StudentPage() {
  const { supabase, profile } = await requireUser("student");
  const [routine] = await getRoutines(supabase, { studentId: profile.id });
  const firstName = profile.full_name.split(" ")[0] || "de nuevo";
  const free = profile.plan === "free";

  return (
    <>
      <Header name={profile.full_name || profile.email} role="student" plan={profile.plan} current="/student" />
      <main className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="title">Hola, {firstName}</h1>
        <p className="mt-2 text-muted">
          {free ? "Plan Free: eliges una rutina y llevas tu seguimiento por tu cuenta." : "Plan Pro: tu entrenador arma y ajusta tu rutina."}
        </p>

        {routine ? (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-3xl font-bold">{routine.name}</h2>
                {routine.description && <p className="max-w-prose text-muted">{routine.description}</p>}
              </div>
              {free && <Link href="/student/plantillas" className="btn btn-outline btn-sm">Cambiar de rutina</Link>}
            </div>
            <RoutineWeek items={routine.routine_items} />
          </section>
        ) : (
          <section className="mt-8 rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
            <h2 className="font-display text-2xl font-bold">Todavía no tienes rutina</h2>
            {free ? (
              <>
                <p className="mt-1 text-sm text-muted">Elige una de las rutinas del plan Free para empezar.</p>
                <Link href="/student/plantillas" className="btn btn-primary mt-4">Elegir rutina</Link>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Tu entrenador la está armando. Aparecerá aquí en cuanto la guarde.</p>
            )}
          </section>
        )}
      </main>
    </>
  );
}
