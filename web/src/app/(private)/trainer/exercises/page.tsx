import Image from "next/image";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { MUSCLE_GROUPS, imageUrl } from "@/lib/routine";
import { DeleteExerciseButton, ExerciseForm } from "./exercise-form";

export default async function ExercisesPage() {
  const { supabase, profile } = await requireUser("trainer");
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, description, image_path")
    .order("name");

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer/exercises" />
      <main className="mx-auto grid w-full max-w-5xl items-start gap-8 px-6 py-8 md:grid-cols-[1fr_22rem]">
        <section className="flex flex-col gap-8">
          <div className="flex items-baseline gap-3">
            <h1 className="title">Ejercicios</h1>
            <span className="text-muted">{exercises?.length ?? 0}</span>
          </div>
          {MUSCLE_GROUPS.map((group) => {
            const list = exercises?.filter((e) => e.muscle_group === group) ?? [];
            if (!list.length) return null;
            return (
              <section key={group}>
                <h2 className="mb-2 font-display text-2xl font-bold capitalize">{group}</h2>
                <ul className="divide-y divide-base-300 rounded-box border border-base-300">
                  {list.map((e) => {
                    const src = imageUrl(e.image_path);
                    return (
                      <li key={e.id} className="flex items-start gap-4 px-4 py-3">
                        {src ? (
                          <Image src={src} alt="" width={56} height={56} className="size-14 shrink-0 rounded-field object-cover" />
                        ) : (
                          <div className="size-14 shrink-0 rounded-field bg-base-200" aria-hidden />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{e.name}</p>
                          <p className="line-clamp-2 text-sm text-muted">{e.description || "Sin descripción."}</p>
                        </div>
                        <DeleteExerciseButton exerciseId={e.id} name={e.name} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </section>
        <ExerciseForm />
      </main>
    </>
  );
}
