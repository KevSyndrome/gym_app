import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { avatarUrls } from "@/lib/avatars";
import { formatDate, formatTime } from "@/lib/dates";
import { DAYS } from "@/lib/routine";
import { InviteForm } from "./invite-form";

export default async function TrainerPage(props: PageProps<"/trainer">) {
  const { supabase, profile } = await requireUser("trainer");
  const { plan: planParam } = await props.searchParams;
  const plan = planParam === "free" ? "free" : "pro";

  const { data: students } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, avatar_path, routines(name), training_slots(day, start_time), workout_sessions!workout_sessions_student_id_fkey(date)")
    .eq("role", "student")
    .order("full_name")
    .order("date", { referencedTable: "workout_sessions", ascending: false })
    .limit(1, { referencedTable: "workout_sessions" });
  const count = { pro: 0, free: 0 };
  students?.forEach((s) => count[s.plan === "pro" ? "pro" : "free"]++);
  const list = students?.filter((s) => s.plan === plan) ?? [];
  const avatars = await avatarUrls(supabase, list.map((s) => s.avatar_path));

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer" />
      <main className="mx-auto grid w-full max-w-5xl items-start gap-8 px-6 py-8 md:grid-cols-[1fr_22rem]">
        <section>
          <h1 className="title mb-5">Alumnos</h1>
          <nav role="tablist" aria-label="Plan" className="tabs tabs-box mb-5 w-fit">
            <Link role="tab" href="/trainer?plan=pro" aria-selected={plan === "pro"} className={`tab ${plan === "pro" ? "tab-active" : ""}`}>
              Plan Pro ({count.pro})
            </Link>
            <Link role="tab" href="/trainer?plan=free" aria-selected={plan === "free"} className={`tab ${plan === "free" ? "tab-active" : ""}`}>
              Plan gratuito ({count.free})
            </Link>
          </nav>
          <p className="mb-4 text-sm text-muted">
            {plan === "pro"
              ? "Les armas la rutina y entrenan contigo en sus horarios."
              : "Eligen una rutina base y entrenan por su cuenta. Puedes ver su progreso."}
          </p>

          {list.length ? (
            <ul className="divide-y divide-base-300 rounded-box border border-base-300">
              {list.map((s) => {
                const last = s.workout_sessions[0]?.date;
                return (
                  <li key={s.id}>
                    <Link href={`/trainer/alumnos/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-base-200">
                      <Avatar name={s.full_name || s.email} url={avatars.get(s.avatar_path ?? "")} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{s.full_name || s.email}</p>
                        <p className="truncate text-sm text-muted">
                          {s.routines[0]?.name ?? (plan === "pro" ? "Sin rutina: ármala" : "Aún no elige rutina")}
                          {plan === "pro" && s.training_slots.length > 0 &&
                            `. ${s.training_slots.map((t) => `${DAYS[t.day - 1].slice(0, 3)} ${formatTime(t.start_time)}`).join(", ")}`}
                        </p>
                      </div>
                      <span className="hidden shrink-0 text-right text-sm text-muted sm:block">
                        {last ? <>Último registro<br />{formatDate(last)}</> : "Sin registros"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
              <p className="font-medium">{plan === "pro" ? "Todavía no tienes alumnos Pro." : "Todavía no hay alumnos en el plan gratuito."}</p>
              <p className="mt-1 text-sm text-muted">
                {plan === "pro" ? "Invita a uno y pásalo a Pro desde su ficha." : "Se registran solos desde la página principal, o invítalos."}
              </p>
            </div>
          )}
        </section>
        <InviteForm />
      </main>
    </>
  );
}
