import Link from "next/link";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { formatTime, todayISO, weekdayOf } from "@/lib/dates";
import { DAYS } from "@/lib/routine";

const end = (start: string, minutes: number) => {
  const [h, m] = start.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export default async function AgendaPage() {
  const { supabase, profile } = await requireUser("trainer");
  const { data: slots } = await supabase
    .from("training_slots")
    .select("id, day, start_time, duration_min, notes, student:profiles(id, full_name, email)")
    .order("day")
    .order("start_time");
  const today = weekdayOf(todayISO());
  // La semana empieza hoy: lo primero que ve el entrenador es lo que le toca.
  const order = Array.from({ length: 7 }, (_, i) => ((today - 1 + i) % 7) + 1);

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer/agenda" />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="title">Agenda</h1>
          <p className="mt-2 text-muted">Tus horarios fijos con alumnos Pro. Se agregan desde la ficha de cada alumno.</p>
        </div>
        {!slots?.length ? (
          <p className="rounded-box border border-dashed border-base-300 p-6 text-center text-muted">
            Aún no tienes horarios. Entra a un alumno Pro y agrega cuándo entrenan.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.map((d) => {
              const daySlots = slots.filter((s) => s.day === d);
              return (
                <section key={d} className={`rounded-box border bg-base-200 ${d === today ? "border-primary" : "border-base-300"}`}>
                  <h2 className="flex items-baseline justify-between border-b border-base-300 px-4 py-2">
                    <span className="font-display text-2xl font-bold">{DAYS[d - 1]}</span>
                    {d === today && <span className="text-sm text-primary">Hoy</span>}
                  </h2>
                  {daySlots.length ? (
                    <ul className="divide-y divide-base-300">
                      {daySlots.map((s) => {
                        const overlaps = daySlots.some((o) => o.id !== s.id && o.start_time < end(s.start_time, s.duration_min) && s.start_time < end(o.start_time, o.duration_min));
                        return (
                          <li key={s.id} className="px-4 py-2">
                            <p className="font-display text-xl">
                              {formatTime(s.start_time)}–{end(s.start_time, s.duration_min)}
                              {overlaps && <span className="ml-2 font-sans text-xs text-warning">Se cruza con otro horario</span>}
                            </p>
                            {s.student && (
                              <Link href={`/trainer/alumnos/${s.student.id}`} className="link">{s.student.full_name || s.student.email}</Link>
                            )}
                            {s.notes && <p className="text-sm text-muted">{s.notes}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-sm text-muted">Libre</p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
