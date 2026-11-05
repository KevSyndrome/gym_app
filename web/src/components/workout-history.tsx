import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { DAYS } from "@/lib/routine";
import { MODE_LABELS, groupByExercise, summarize, type Session } from "@/lib/workouts";

export function WorkoutHistory({
  sessions,
  editHref,
  highlight,
  empty,
}: {
  sessions: Session[];
  editHref: (date: string) => string;
  highlight?: string;
  empty: string;
}) {
  if (!sessions.length) {
    return <p className="rounded-box border border-dashed border-base-300 p-6 text-center text-muted">{empty}</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => {
        const exercises = groupByExercise(s.set_logs);
        const byTrainer = s.logged_by && s.logged_by !== s.student_id;
        return (
          <article
            key={s.id}
            className={`rounded-box border bg-base-200 p-4 sm:p-5 ${highlight === s.date ? "border-primary" : "border-base-300"}`}
          >
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-display text-2xl font-bold first-letter:uppercase">{formatDate(s.date)}</h3>
              <div className="flex items-center gap-2">
                <span className="badge badge-outline text-muted">{MODE_LABELS[s.mode]}</span>
                <Link href={editHref(s.date)} className="btn btn-ghost btn-xs">Editar</Link>
              </div>
            </header>
            <p className="mb-3 text-sm text-muted">
              {s.routine_day ? `Rutina del ${DAYS[s.routine_day - 1].toLowerCase()}` : "Sin rutina"}
              {byTrainer && ". Lo registró el entrenador"}
            </p>
            {exercises.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr><th>Ejercicio</th><th>Plan</th><th>Hecho</th></tr>
                  </thead>
                  <tbody className="font-display text-base">
                    {exercises.map((e) => {
                      const r = summarize(e.sets);
                      return (
                        <tr key={e.exerciseId}>
                          <td className="font-sans text-sm">{e.name}</td>
                          <td className="whitespace-nowrap text-muted">{r.plan}</td>
                          <td className={r.changed ? "text-primary" : ""}>{r.done}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {s.notes && <p className="mt-3 max-w-prose text-sm">{s.notes}</p>}
          </article>
        );
      })}
      <p className="text-sm text-muted">En naranja, lo que cambió respecto al plan.</p>
    </div>
  );
}
