import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Header } from "@/components/header";
import { WorkoutHistory } from "@/components/workout-history";
import { requireUser } from "@/lib/auth";
import { avatarUrls } from "@/lib/avatars";
import { formatTime } from "@/lib/dates";
import { DAYS } from "@/lib/routine";
import { getSessions } from "@/lib/workouts";
import { AccessLinkButton } from "../../access-link-button";
import { deleteSlot, setPlan } from "../../actions";
import { SlotForm } from "./slot-form";

export default async function StudentDetail(props: PageProps<"/trainer/alumnos/[id]">) {
  const { supabase, profile } = await requireUser("trainer");
  const { id } = await props.params;
  const { guardado } = await props.searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: student } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, avatar_path, routines(id, name), training_slots(id, day, start_time, duration_min, notes)")
    .eq("id", id)
    .eq("role", "student")
    .order("day", { referencedTable: "training_slots" })
    .order("start_time", { referencedTable: "training_slots" })
    .single();
  if (!student) notFound();
  const [sessions, avatars] = await Promise.all([getSessions(supabase, id), avatarUrls(supabase, [student.avatar_path])]);
  const pro = student.plan === "pro";
  const routine = student.routines[0];
  const name = student.full_name || student.email;

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer" />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <div>
          <Link href={`/trainer?plan=${student.plan}`} className="link text-sm text-muted">Alumnos</Link>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Avatar name={name} url={avatars.get(student.avatar_path ?? "")} size="size-16" />
            <div className="min-w-0 flex-1">
              <h1 className="title">{name}</h1>
              <p className="text-muted">{student.email}</p>
            </div>
            <form action={setPlan} className="flex items-center gap-2">
              <input type="hidden" name="student_id" value={student.id} />
              <input type="hidden" name="plan" value={pro ? "free" : "pro"} />
              <span className={`badge ${pro ? "badge-primary" : "badge-outline text-muted"}`}>{pro ? "Plan Pro" : "Plan gratuito"}</span>
              <button className="btn btn-ghost btn-xs">{pro ? "Pasar a gratuito" : "Pasar a Pro"}</button>
            </form>
          </div>
          <div className="mt-2"><AccessLinkButton studentId={student.id} /></div>
        </div>

        <div className="grid items-start gap-8 md:grid-cols-[1fr_22rem]">
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-3xl font-bold">Progreso</h2>
              <Link href={`/trainer/alumnos/${student.id}/registrar`} className="btn btn-primary btn-sm">Registrar sesión</Link>
            </div>
            {guardado && <p role="status" className="alert alert-success">Sesión guardada.</p>}
            <WorkoutHistory
              sessions={sessions}
              highlight={typeof guardado === "string" ? guardado : undefined}
              editHref={(date) => `/trainer/alumnos/${student.id}/registrar?fecha=${date}`}
              empty="Todavía no hay sesiones registradas."
            />
          </section>

          <aside className="flex flex-col gap-6">
            <section className="rounded-box border border-base-300 bg-base-200 p-5">
              <h2 className="font-display text-2xl font-bold">Rutina</h2>
              {routine ? (
                <Link href={`/trainer/routines/${routine.id}`} className="link link-primary">{routine.name}</Link>
              ) : pro ? (
                <Link href={`/trainer/routines?alumno=${student.id}`} className="btn btn-primary btn-sm mt-2">Armar su rutina</Link>
              ) : (
                <p className="text-sm text-muted">Aún no elige una rutina del plan gratuito.</p>
              )}
            </section>

            {pro && (
              <section className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-200 p-5">
                <h2 className="font-display text-2xl font-bold">Horario</h2>
                {student.training_slots.length ? (
                  <ul className="divide-y divide-base-300">
                    {student.training_slots.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                        <span>
                          {DAYS[s.day - 1]} {formatTime(s.start_time)}, {s.duration_min} min
                          {s.notes && <span className="block text-sm text-muted">{s.notes}</span>}
                        </span>
                        <form action={deleteSlot}>
                          <input type="hidden" name="slot_id" value={s.id} />
                          <input type="hidden" name="student_id" value={student.id} />
                          <button className="btn btn-ghost btn-xs text-muted" aria-label={`Quitar ${DAYS[s.day - 1]} ${formatTime(s.start_time)}`}>Quitar</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">Sin horarios. Agrega cuándo entrenan juntos.</p>
                )}
                <SlotForm studentId={student.id} />
              </section>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
