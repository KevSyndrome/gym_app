import Link from "next/link";
import { Header } from "@/components/header";
import { RoutineWeek } from "@/components/routine-week";
import { requireUser } from "@/lib/auth";
import { formatDate, formatTime, todayISO, weekdayOf } from "@/lib/dates";
import { DAYS, byDay, getRoutines } from "@/lib/routine";
import { getSessions } from "@/lib/workouts";

export default async function TodayPage(props: PageProps<"/student">) {
  const { supabase, profile } = await requireUser("student");
  const { dia } = await props.searchParams;
  const today = todayISO();
  const todayDay = weekdayOf(today);
  const [[routine], [logged], { data: slots }] = await Promise.all([
    getRoutines(supabase, { studentId: profile.id }),
    getSessions(supabase, profile.id, { date: today }),
    supabase.from("training_slots").select("day, start_time, duration_min, notes").eq("student_id", profile.id).order("day").order("start_time"),
  ]);
  const days = byDay(routine?.routine_items ?? []);
  const selected = Number(dia) >= 1 && Number(dia) <= 7 ? Number(dia) : todayDay;
  const free = profile.plan === "free";
  const todaySlots = slots?.filter((s) => s.day === todayDay) ?? [];

  return (
    <>
      <Header name={profile.full_name || profile.email} role="student" plan={profile.plan} current="/student" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <div>
          <p className="text-muted first-letter:uppercase">{formatDate(today)}</p>
          <h1 className="title mt-1">Hoy</h1>
        </div>

        {!routine ? (
          <section className="rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
            <h2 className="font-display text-2xl font-bold">Todavía no tienes rutina</h2>
            {free ? (
              <>
                <p className="mt-1 text-sm text-muted">Elige una de las rutinas del plan gratuito para empezar.</p>
                <Link href="/student/plantillas" className="btn btn-primary mt-4">Elegir rutina</Link>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Tu entrenador la está armando. Aparecerá aquí en cuanto la guarde.</p>
            )}
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-3 rounded-box border border-primary bg-base-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {todaySlots.length > 0 && (
                  <p className="font-medium">
                    Hoy entrenas con tu entrenador a las {todaySlots.map((s) => formatTime(s.start_time)).join(" y ")}.
                  </p>
                )}
                <p className={todaySlots.length ? "text-sm text-muted" : "font-medium"}>
                  {logged ? "Ya registraste tu entrenamiento de hoy." : days.has(todayDay) ? `Hoy toca: rutina del ${DAYS[todayDay - 1].toLowerCase()}.` : "Hoy no tienes rutina programada; puedes registrar otro día de tu rutina."}
                </p>
              </div>
              <Link href="/student/registrar" className="btn btn-primary shrink-0">
                {logged ? "Ver o corregir" : "Registrar entrenamiento"}
              </Link>
            </section>

            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-3xl font-bold">{routine.name}</h2>
                  {routine.description && <p className="max-w-prose text-muted">{routine.description}</p>}
                </div>
                {free && <Link href="/student/plantillas" className="btn btn-outline btn-sm">Cambiar de rutina</Link>}
              </div>
              <nav role="tablist" aria-label="Días de la rutina" className="tabs tabs-box mb-4 overflow-x-auto">
                {DAYS.map((name, i) => {
                  const d = i + 1;
                  return (
                    <Link
                      key={d}
                      role="tab"
                      href={`/student?dia=${d}`}
                      aria-selected={d === selected}
                      className={`tab ${d === selected ? "tab-active" : ""} ${days.has(d) ? "" : "opacity-40"}`}
                    >
                      {name.slice(0, 3)}{d === todayDay && " (hoy)"}
                    </Link>
                  );
                })}
              </nav>
              <RoutineWeek
                items={days.get(selected) ?? []}
                empty={`Día de descanso: tu rutina no tiene ejercicios el ${DAYS[selected - 1].toLowerCase()}.`}
              />
            </section>
          </>
        )}

        {!free && slots && slots.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-2xl font-bold">Tus horarios con el entrenador</h2>
            <ul className="divide-y divide-base-300 rounded-box border border-base-300">
              {slots.map((s, i) => (
                <li key={i} className={`flex justify-between gap-4 px-4 py-2 ${s.day === todayDay ? "text-primary" : ""}`}>
                  <span>{DAYS[s.day - 1]}</span>
                  <span>{formatTime(s.start_time)}, {s.duration_min} min{s.notes && `. ${s.notes}`}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
