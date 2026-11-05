"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MIN = 12; // igual que minimum_password_length en supabase/config.toml

export default function SetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== form.get("confirm")) return setError("Las contraseñas no coinciden.");
    setPending(true);
    const { error } = await createClient().auth.updateUser({ password });
    setPending(false);
    if (error) return setError(error.code === "weak_password"
      ? `Usa al menos ${MIN} caracteres y evita contraseñas filtradas o comunes.`
      : "No se pudo guardar la contraseña. Pide una nueva invitación.");
    router.replace("/panel");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Elige tu contraseña</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          Contraseña (mínimo {MIN} caracteres)
          <input name="password" type="password" required minLength={MIN} maxLength={128} autoComplete="new-password" className="rounded border p-2" />
        </label>
        <label className="flex flex-col gap-1">
          Repite la contraseña
          <input name="confirm" type="password" required minLength={MIN} maxLength={128} autoComplete="new-password" className="rounded border p-2" />
        </label>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button disabled={pending} className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50">
          {pending ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
    </main>
  );
}
