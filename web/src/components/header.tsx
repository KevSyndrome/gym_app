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
    { href: "/trainer/agenda", label: "Agenda" },
    { href: "/trainer/routines", label: "Rutinas" },
    { href: "/trainer/exercises", label: "Ejercicios" },
    { href: "/trainer/catalogos", label: "Catálogos" },
  ],
  student: [
    { href: "/student", label: "Hoy" },
    { href: "/student/registrar", label: "Registrar" },
    { href: "/student/progreso", label: "Progreso" },
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
          <nav className="flex flex-wrap gap-1" aria-label="Secciones">
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
        <form action={signOut} className="flex items-center gap-2">
          <Link
            href="/perfil"
            aria-current={current === "/perfil" ? "page" : undefined}
            className={`btn btn-ghost btn-sm ${current === "/perfil" ? "text-primary" : "text-muted"}`}
          >
            <span className="max-w-40 truncate">{name}</span>
            <span className="hidden md:inline">({role === "trainer" ? "entrenador" : "alumno"})</span>
          </Link>
          <button className="btn btn-outline btn-sm">Cerrar sesión</button>
        </form>
      </div>
    </header>
  );
}
