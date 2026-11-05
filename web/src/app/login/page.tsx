"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/header";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const linkError = useSearchParams().get("error");
  const [error, setError] = useState(linkError ? "El enlace no es válido o expiró." : "");
  const [pending, setPending] = useState(false);
  // false en el HTML del servidor, true al hidratar: evita enviar el formulario antes de que cargue el JS.
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);

  // Se loguea desde el navegador para que el límite de intentos de Supabase cuente por IP del usuario.
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) return setError("Correo o contraseña incorrectos.");
    router.replace("/panel");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <Wordmark />
      <div className="flex flex-col gap-2">
        <h1 className="title">Iniciar sesión</h1>
      </div>
      <form method="post" onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Correo
          <input name="email" type="email" required autoComplete="email" className="input w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" className="input w-full" />
        </label>
        {error && <p role="alert" className="text-error">{error}</p>}
        <button disabled={pending || !hydrated} className="btn btn-primary mt-2">
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
