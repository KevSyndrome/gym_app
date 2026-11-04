import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";

export default async function StudentPage() {
  const { profile } = await requireUser("student");
  return (
    <>
      <Header name={profile.full_name || profile.email} />
      <main className="mx-auto w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Hola, {profile.full_name || "alumno"}</h1>
        <p className="mt-2">Plan: <strong className="uppercase">{profile.plan}</strong></p>
        <p className="mt-4 opacity-70">Tu rutina semanal aparecerá aquí cuando tu entrenador la publique.</p>
      </main>
    </>
  );
}
