"use client";
import { useActionState, useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, type ProfileState } from "./actions";

const MIN = 12; // igual que minimum_password_length en supabase/config.toml

export function ProfileForm({ fullName, hasAvatar }: { fullName: string; hasAvatar: boolean }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  return (
    <section className="rounded-box border border-base-300 bg-base-200 p-5">
      <h2 className="mb-4 font-display text-2xl font-bold">Datos</h2>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Nombre
          <input name="full_name" required maxLength={120} defaultValue={fullName} autoComplete="name" className="input w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Foto de perfil (JPG, PNG o WEBP, hasta 2 MB)
          <input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" className="file-input w-full" />
        </label>
        {hasAvatar && (
          <label className="flex items-center gap-2 text-sm">
            <input name="remove_avatar" type="checkbox" className="checkbox checkbox-sm" />
            Quitar la foto actual
          </label>
        )}
        {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
        {state.ok && <p role="status" className="text-sm text-success">{state.ok}</p>}
        <button disabled={pending} className="btn btn-primary self-start">{pending ? "Guardando…" : "Guardar datos"}</button>
      </form>
    </section>
  );
}

export function PasswordForm({ email }: { email: string }) {
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, setPending] = useState(false);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const password = String(form.get("password"));
    setError("");
    setOk("");
    if (password !== form.get("confirm")) return setError("Las contraseñas nuevas no coinciden.");
    setPending(true);
    const supabase = createClient();
    // Pedir la actual evita que alguien con la sesión abierta la cambie, y deja el inicio de sesión reciente
    // que exige secure_password_change.
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: String(form.get("current")) });
    if (authError) {
      setPending(false);
      return setError("La contraseña actual no es correcta.");
    }
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      return setError(error.code === "weak_password" || error.code === "same_password"
        ? `Usa al menos ${MIN} caracteres, distinta a la actual y que no sea común.`
        : "No se pudo cambiar la contraseña. Intenta de nuevo.");
    }
    formEl.reset();
    setOk("Contraseña cambiada.");
  }

  return (
    <section className="rounded-box border border-base-300 bg-base-200 p-5">
      <h2 className="mb-4 font-display text-2xl font-bold">Contraseña</h2>
      <form method="post" onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Ayuda a los gestores de contraseñas a asociar la clave a la cuenta. */}
        <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Contraseña actual
          <input name="current" type="password" required autoComplete="current-password" className="input w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Nueva contraseña (mínimo {MIN} caracteres)
          <input name="password" type="password" required minLength={MIN} maxLength={128} autoComplete="new-password" className="input w-full" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Repite la nueva contraseña
          <input name="confirm" type="password" required minLength={MIN} maxLength={128} autoComplete="new-password" className="input w-full" />
        </label>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        {ok && <p role="status" className="text-sm text-success">{ok}</p>}
        <button disabled={pending || !hydrated} className="btn btn-primary self-start">{pending ? "Cambiando…" : "Cambiar contraseña"}</button>
      </form>
    </section>
  );
}
