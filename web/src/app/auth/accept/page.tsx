"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// shortcut: el correo por defecto de Supabase entrega la sesión en el #hash (flujo implícito).
// Al configurar SMTP propio, volver a la plantilla con token_hash verificada en servidor.
export default function AcceptInvite() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    history.replaceState(null, "", window.location.pathname); // saca los tokens de la barra e historial
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    // invite: primera vez; magiclink: "Nuevo enlace de acceso" del entrenador; signup: confirmar registro.
    const type = params.get("type") ?? "";
    if (!["invite", "magiclink", "signup"].includes(type) || !access_token || !refresh_token) {
      router.replace("/login?error=enlace");
      return;
    }
    // setSession valida el token contra Supabase antes de guardarlo en cookies.
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => router.replace(error ? "/login?error=enlace" : type === "signup" ? "/panel" : "/set-password"));
  }, [router]);

  return <main className="flex flex-1 items-center justify-center p-6 text-muted" role="status">Validando tu invitación…</main>;
}
