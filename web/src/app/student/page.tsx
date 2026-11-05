import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";

export default async function StudentPage() {
  const { profile } = await requireUser("student");
  const firstName = profile.full_name.split(" ")[0] || "de nuevo";

  return (
    <>
      <Header name={profile.full_name || profile.email} role="student" />
      <main className="mx-auto w-full max-w-2xl px-6 py-8">
        <h1 className="title">Hola, {firstName}</h1>
        <p className="mt-2 text-muted">
          Plan {profile.plan === "pro" ? "Pro: rutina personalizada por tu entrenador." : "Free: rutinas generales para elegir."}
        </p>
        <section className="mt-8 rounded-lg border border-dashed border-line px-6 py-10 text-center">
          <h2 className="font-display text-2xl font-bold">Tu semana</h2>
          <p className="mt-1 text-sm text-muted">Aquí verás tu rutina día por día en cuanto tu entrenador la publique.</p>
        </section>
      </main>
    </>
  );
}
