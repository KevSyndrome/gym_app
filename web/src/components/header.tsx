import { signOut } from "@/app/actions";

export function Header({ name }: { name: string }) {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <span className="font-bold">gym_app</span>
      <form action={signOut} className="flex items-center gap-3">
        <span className="text-sm">{name}</span>
        <button className="rounded border px-3 py-1 text-sm">Salir</button>
      </form>
    </header>
  );
}
