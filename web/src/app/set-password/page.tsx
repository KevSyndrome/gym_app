"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/header";
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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <Wordmark />
      <div className="flex flex-col gap-2">
        <h1 className="title">Elige tu contraseña</h1>
        <p className="text-muted">Con ella entrarás de ahora en adelante.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="label">
          Contraseña (mínimo {MIN} caracteres)
          <input name="password" type="password" required minLength={MIN} maxLength={128} autoComplete="new-password" className="input" />
        </label>
        <label className="label">
          Repite la contraseña
          <input name="confirm" type="password" required minLength={MIN} maxLength={128} autoComplete="new-password" className="input" />
        </label>
        {error && <p role="alert" className="text-danger">{error}</p>}
        <button disabled={pending} className="btn mt-2">
          {pending ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
    </main>
  );
}
