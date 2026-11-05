import Link from "next/link";

// shortcut: landing mínima; los planes Free/Pro y Stripe llegan en la fase 5.
export default function Home() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold">gym_app</h1>
      <p>Tu rutina, tus horarios y tu progreso, junto a tu entrenador.</p>
      <Link href="/login" className="w-fit rounded bg-foreground px-4 py-2 text-background">
        Iniciar sesión
      </Link>
    </main>
  );
}
