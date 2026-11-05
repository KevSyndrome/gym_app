import Link from "next/link";
import { signOut } from "@/app/actions";

export function Wordmark() {
  return (
    <Link href="/" className="font-display text-2xl font-bold tracking-tight">
      gym<span className="text-primary">/</span>app
    </Link>
  );
}

const NAV = {
  trainer: [
    { href: "/trainer", label: "Alumnos" },
    { href: "/trainer/routines", label: "Rutinas" },
    { href: "/trainer/exercises", label: "Ejercicios" },
  ],
  student: [
    { href: "/student", label: "Mi semana" },
    { href: "/student/plantillas", label: "Elegir rutina", freeOnly: true },
  ],
};

export function Header({
  name,
  role,
  plan,
  current,
}: {
  name: string;
  role: "trainer" | "student";
  plan?: string;
  current?: string;
}) {
  return (
    <header className="border-b border-base-300">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
        <div className="flex items-center gap-6">
          <Wordmark />
          <nav className="flex gap-1" aria-label="Secciones">
            {NAV[role].filter((item) => !("freeOnly" in item) || plan === "free").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current === item.href ? "page" : undefined}
                className={`btn btn-ghost btn-sm ${current === item.href ? "text-primary" : "text-muted"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={signOut} className="flex items-center gap-4">
          <span className="hidden text-sm text-muted md:inline">
            {name} ({role === "trainer" ? "entrenador" : "alumno"})
          </span>
          <button className="btn btn-outline btn-sm">Cerrar sesión</button>
        </form>
      </div>
    </header>
  );
}
