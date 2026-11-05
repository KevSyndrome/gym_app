import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { RoutineWeek } from "@/components/routine-week";
import { requireUser } from "@/lib/auth";
import { byDay, getRoutines } from "@/lib/routine";
import { chooseTemplate } from "../actions";

export default async function TemplatesPage(props: PageProps<"/student/plantillas">) {
  const { supabase, profile } = await requireUser("student");
  if (profile.plan !== "free") redirect("/student");
  const { error } = await props.searchParams;
  const [templates, [current]] = await Promise.all([
    getRoutines(supabase, { templates: true }),
    getRoutines(supabase, { studentId: profile.id }),
  ]);

  return (
    <>
      <Header name={profile.full_name || profile.email} role="student" plan={profile.plan} current="/student/plantillas" />
      <main className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="title">Elige tu rutina</h1>
        <p className="mt-2 max-w-prose text-muted">
          Son rutinas generales de tu entrenador. Si quieres una hecha a tu medida y que te acompañe, pásate a Pro.
          {current && " Elegir otra reemplaza la que tienes ahora."}
        </p>
        {error && <p role="alert" className="mt-4 text-error">No se pudo elegir esa rutina. Intenta de nuevo.</p>}

        <div className="mt-8 flex flex-col gap-4">
          {templates.map((t) => (
            <details key={t.id} className="collapse collapse-arrow rounded-box border border-base-300 bg-base-200">
              <summary className="collapse-title">
                <span className="font-display text-2xl font-bold">{t.name}</span>
                <span className="block text-sm text-muted">
                  {byDay(t.routine_items).size} días por semana, {t.routine_items.length} ejercicios. {t.description}
                </span>
              </summary>
              <div className="collapse-content flex flex-col gap-4">
                <RoutineWeek items={t.routine_items} />
                <form action={chooseTemplate}>
                  <input type="hidden" name="template_id" value={t.id} />
                  <button className="btn btn-primary">Usar esta rutina</button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
