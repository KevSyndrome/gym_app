import Link from "next/link";
import { Wordmark } from "@/components/header";

const board = [
  { name: "Sentadilla", plan: "4 × 10 a 60 kg", done: "4 × 8 a 65 kg", changed: true },
  { name: "Press de banca", plan: "4 × 8 a 40 kg", done: "4 × 8 a 40 kg", changed: false },
  { name: "Remo con barra", plan: "3 × 12 a 35 kg", done: "3 × 12 a 37,5 kg", changed: true },
  { name: "Dominadas", plan: "3 × 6", done: "No la hizo: molestia en el hombro", changed: true },
];

// shortcut: landing mínima; los planes Free/Pro y Stripe llegan en la fase 5.
export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Wordmark />
        <Link href="/login" className="btn btn-outline btn-sm">Iniciar sesión</Link>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 pb-16 pt-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="max-w-xl">
          <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
            Entrena con plan. Anota lo que de verdad hiciste.
          </h1>
          <p className="mt-6 text-lg text-muted">
            Tu entrenador arma la rutina de la semana. Tú la ves en el teléfono y registras cada serie,
            también los días que entrenas solo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/login" className="btn btn-primary btn-lg">Iniciar sesión</Link>
            <p className="text-sm text-muted">¿Sin cuenta? Pídele a tu entrenador que te invite.</p>
          </div>
        </section>

        <figure className="rounded-lg border border-base-300 bg-base-200 p-5 sm:p-7">
          <figcaption className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="font-display text-2xl font-bold">Martes, pierna y espalda</span>
            <span className="text-sm text-muted">Entrenó solo</span>
          </figcaption>
          <table className="w-full text-left">
            <thead className="text-sm text-muted">
              <tr className="border-b border-base-300">
                <th className="pb-2 font-medium">Ejercicio</th>
                <th className="pb-2 font-medium">Plan</th>
                <th className="pb-2 font-medium">Hecho</th>
              </tr>
            </thead>
            <tbody className="font-display text-base sm:text-xl">
              {board.map((row) => (
                <tr key={row.name} className="border-b border-base-300/60 last:border-0">
                  <td className="py-3 pr-3 font-sans text-sm sm:text-base">{row.name}</td>
                  <td className="whitespace-nowrap py-3 pr-3 text-muted">{row.plan}</td>
                  <td className={`py-3 ${row.done.length < 20 ? "whitespace-nowrap" : ""} ${row.changed ? "text-primary" : ""}`}>{row.done}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 text-sm text-muted">
            En naranja, lo que cambió respecto al plan. Tu entrenador lo ve en tu progreso.
          </p>
        </figure>
      </main>
    </>
  );
}
