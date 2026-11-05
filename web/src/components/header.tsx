import Link from "next/link";
import { signOut } from "@/app/actions";

export function Wordmark() {
  return (
    <Link href="/" className="font-display text-2xl font-bold tracking-tight">
      gym<span className="text-accent">/</span>app
    </Link>
  );
}

export function Header({ name, role }: { name: string; role: "trainer" | "student" }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Wordmark />
        <form action={signOut} className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">
            {name} <span className="text-muted/70">({role === "trainer" ? "entrenador" : "alumno"})</span>
          </span>
          <button className="btn-ghost">Cerrar sesión</button>
        </form>
      </div>
    </header>
  );
}
