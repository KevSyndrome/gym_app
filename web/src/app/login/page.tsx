"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const linkError = useSearchParams().get("error");
  const [error, setError] = useState(linkError ? "El enlace no es válido o expiró." : "");
  const [pending, setPending] = useState(false);

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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          Correo
          <input name="email" type="email" required autoComplete="email" className="rounded border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" className="rounded border p-2" />
        </label>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button disabled={pending} className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50">
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
