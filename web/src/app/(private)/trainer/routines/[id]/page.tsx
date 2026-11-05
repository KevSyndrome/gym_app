import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { RoutineWeek } from "@/components/routine-week";
import { requireUser } from "@/lib/auth";
import { getCatalog, getRoutines } from "@/lib/routine";
import { deleteItem, deleteRoutine } from "../../actions";
import { AddItemForm } from "./add-item-form";

export default async function RoutinePage(props: PageProps<"/trainer/routines/[id]">) {
  const { supabase, profile } = await requireUser("trainer");
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [[routine], { data: exercises }, groups] = await Promise.all([
    getRoutines(supabase, { id }),
    supabase.from("exercises").select("id, name, muscle_group").order("name"),
    getCatalog(supabase, "muscle_groups"),
  ]);
  if (!routine) notFound();
  const { data: student } = routine.student_id
    ? await supabase.from("profiles").select("full_name, email").eq("id", routine.student_id).single()
    : { data: null };

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer/routines" />
      <main className="mx-auto grid w-full max-w-5xl items-start gap-8 px-6 py-8 md:grid-cols-[1fr_22rem]">
        <section className="flex flex-col gap-6">
          <div>
            <Link href="/trainer/routines" className="link text-sm text-muted">Rutinas</Link>
            <h1 className="title mt-1">{routine.name}</h1>
            <p className="mt-2 text-muted">
              {student ? `Rutina de ${student.full_name || student.email}` : "Plantilla del plan gratuito"}
            </p>
            {routine.description && <p className="mt-2 max-w-prose">{routine.description}</p>}
          </div>
          <RoutineWeek
            items={routine.routine_items}
            empty="Agrega el primer ejercicio con el formulario."
            itemAction={(item) => (
              <form action={deleteItem} className="shrink-0">
                <input type="hidden" name="item_id" value={item.id} />
                <input type="hidden" name="routine_id" value={routine.id} />
                <button className="btn btn-ghost btn-xs text-muted" aria-label={`Quitar ${item.exercise.name}`}>Quitar</button>
              </form>
            )}
          />
          <form action={deleteRoutine} className="border-t border-base-300 pt-6">
            <input type="hidden" name="routine_id" value={routine.id} />
            <button className="btn btn-outline btn-error btn-sm">Borrar rutina</button>
            <p className="mt-2 text-xs text-muted">
              {student ? "El alumno se queda sin rutina hasta que le armes otra." : "Los alumnos que ya la eligieron conservan su copia."}
            </p>
          </form>
        </section>
        <AddItemForm routineId={routine.id} exercises={exercises ?? []} groups={groups} />
      </main>
    </>
  );
}
