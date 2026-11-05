import { Header } from "@/components/header";
import { Avatar } from "@/components/avatar";
import { requireUser } from "@/lib/auth";
import { avatarUrls } from "@/lib/avatars";
import { PasswordForm, ProfileForm } from "./forms";

export default async function ProfilePage() {
  const { supabase, profile } = await requireUser();
  const role = profile.role === "trainer" ? "trainer" : "student";
  const url = (await avatarUrls(supabase, [profile.avatar_path])).get(profile.avatar_path ?? "");

  return (
    <>
      <Header name={profile.full_name || profile.email} role={role} plan={profile.plan} current="/perfil" />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-8">
        <div className="flex items-center gap-4">
          <Avatar name={profile.full_name || profile.email} url={url} size="size-16" />
          <div>
            <h1 className="title">Tu perfil</h1>
            <p className="text-muted">
              {profile.email}. {role === "trainer" ? "Entrenador." : `Alumno, plan ${profile.plan === "pro" ? "Pro" : "Free"}.`}
            </p>
          </div>
        </div>
        <ProfileForm fullName={profile.full_name} hasAvatar={!!profile.avatar_path} />
        <PasswordForm email={profile.email} />
      </main>
    </>
  );
}
