import Link from "next/link";
import { Wordmark } from "@/components/header";

const board = [
  { name: "Sentadilla", plan: "4 × 10 a 60 kg", done: "4 × 8 a 65 kg", changed: true },
  { name: "Press de banca", plan: "4 × 8 a 40 kg", done: "4 × 8 a 40 kg", changed: false },
  { name: "Remo con barra", plan: "3 × 12 a 35 kg", done: "3 × 12 a 37,5 kg", changed: true },
  { name: "Dominadas", plan: "3 × 6", done: "No la hizo: molestia en el hombro", changed: true },
];

const PLANS = [
  {
    name: "Gratuito",
    price: "Gratis",
    summary: "Para entrenar por tu cuenta con una rutina bien armada.",
    features: [
      "Eliges entre rutinas hechas por un entrenador",
      "Ves tu semana día por día en el teléfono",
      "Anotas tus series, pesos y lo que no pudiste hacer",
    ],
    cta: "Crear cuenta gratis",
    href: "/registro",
    featured: false,
  },
  {
    name: "Pro",
    // shortcut: precio y cobro en línea llegan con Stripe en la fase 5.
    price: "Pago mensual",
    summary: "Para entrenar con tu entrenador, también los días que no puede estar.",
    features: [
      "Rutina hecha a tu medida, con indicaciones por ejercicio",
      "Horarios para entrenar con tu entrenador",
      "Tu entrenador ve tu progreso y ajusta la rutina",
      "Todo lo del plan gratuito",
    ],
    cta: "Empezar con Pro",
    href: "/registro",
    featured: true,
    note: "Crea tu cuenta y tu entrenador activa Pro; el pago en línea llega pronto.",
  },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Wordmark />
        <Link href="/login" className="btn btn-outline btn-sm">Iniciar sesión</Link>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20">
        <div className="grid items-center gap-12 pt-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="max-w-xl">
          <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
            Entrena con plan. Anota lo que de verdad hiciste.
          </h1>
          <p className="mt-6 text-lg text-muted">
            Tu entrenador arma la rutina de la semana. Tú la ves en el teléfono y registras cada serie,
            también los días que entrenas solo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/registro" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
            <a href="#planes" className="btn btn-ghost btn-lg">Ver planes</a>
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
        </div>

        <section id="planes" className="mt-24 scroll-mt-8">
          <h2 className="font-display text-5xl font-bold tracking-tight">Elige cómo entrenar</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-box border bg-base-200 p-6 sm:p-8 ${plan.featured ? "border-primary" : "border-base-300"}`}
              >
                <h3 className={`font-display text-4xl font-bold ${plan.featured ? "text-primary" : ""}`}>{plan.name}</h3>
                <p className="mt-1 text-muted">{plan.price}</p>
                <p className="mt-4">{plan.summary}</p>
                <ul className="mt-5 flex flex-1 flex-col gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 h-0.5 w-3 shrink-0 bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`btn mt-8 ${plan.featured ? "btn-primary" : "btn-outline"}`}>{plan.cta}</Link>
                {plan.note && <p className="mt-3 text-sm text-muted">{plan.note}</p>}
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
