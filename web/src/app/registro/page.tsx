"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/header";
import { createClient } from "@/lib/supabase/client";

const MIN = 12; // igual que minimum_password_length en supabase/config.toml

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [pending, setPending] = useState(false);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setPending(true);
    const { data, error } = await createClient().auth.signUp({
      email,
      password: String(form.get("password")),
      options: {
        data: { full_name: String(form.get("full_name")).slice(0, 120) },
        emailRedirectTo: `${window.location.origin}/auth/accept`,
      },
    });
    setPending(false);
    // Sin confirmación de correo, Supabase devuelve la sesión al tiro; con confirmación, hay que revisar el correo.
    if (!error && data.session) {
      router.replace("/panel");
      return router.refresh();
    }
    if (!error) return setSentTo(email);
    setError(
      error.code === "user_already_exists"
        ? "Ese correo ya tiene cuenta. Inicia sesión."
        : error.code === "signup_disabled"
        ? "El registro abre pronto. Mientras tanto, pídele a tu entrenador un enlace de invitación."
        : error.code === "weak_password"
          ? `Usa al menos ${MIN} caracteres y evita contraseñas comunes o filtradas.`
          : "No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.",
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <Wordmark />
      {sentTo ? (
        <div role="status" className="flex flex-col gap-2">
          <h1 className="title">Revisa tu correo</h1>
          <p className="text-muted">Te mandamos un enlace a {sentTo} para confirmar tu cuenta.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="title">Crea tu cuenta gratis</h1>
            <p className="text-muted">Plan Free: eliges una rutina y llevas tu seguimiento. Puedes pasarte a Pro cuando quieras.</p>
          </div>
          {/* method=post: si se envía antes de cargar el JS, los datos no van en la URL. */}
          <form method="post" onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Nombre
              <input name="full_name" required maxLength={120} autoComplete="name" className="input w-full" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Correo
              <input name="email" type="email" required autoComplete="email" className="input w-full" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Contraseña (mínimo {MIN} caracteres)
              <input name="password" type="password" required minLength={MIN} maxLength={128} autoComplete="new-password" className="input w-full" />
            </label>
            {error && <p role="alert" className="text-error">{error}</p>}
            <button disabled={pending || !hydrated} className="btn btn-primary mt-2">
              {pending ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>
          <p className="text-sm text-muted">
            ¿Ya tienes cuenta? <Link href="/login" className="link link-primary">Inicia sesión</Link>
          </p>
        </>
      )}
    </main>
  );
}
