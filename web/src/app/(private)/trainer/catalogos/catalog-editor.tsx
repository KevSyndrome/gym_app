"use client";
import { useActionState } from "react";
import { addCatalogItem, deleteCatalogItem, type FormState } from "../actions";

export function CatalogEditor({ table, title, help, items }: { table: string; title: string; help: string; items: string[] }) {
  const [addState, add, adding] = useActionState<FormState, FormData>(addCatalogItem, {});
  const [delState, del] = useActionState<FormState, FormData>(deleteCatalogItem, {});
  return (
    <section className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-200 p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted">{help}</p>
      </div>
      <ul className="divide-y divide-base-300">
        {items.map((name) => (
          <li key={name} className="flex items-center justify-between gap-2 py-1.5">
            <span className="first-letter:uppercase">{name}</span>
            <form action={del}>
              <input type="hidden" name="table" value={table} />
              <input type="hidden" name="name" value={name} />
              <button className="btn btn-ghost btn-xs text-muted" aria-label={`Borrar ${name}`}>Borrar</button>
            </form>
          </li>
        ))}
      </ul>
      {delState.error && <p role="alert" className="text-sm text-error">{delState.error}</p>}
      <form action={add} className="flex gap-2 border-t border-base-300 pt-3">
        <input type="hidden" name="table" value={table} />
        <input name="name" required maxLength={table === "skip_reasons" ? 80 : 40} placeholder="Agregar…" aria-label={`Agregar a ${title}`} className="input input-sm w-full" />
        <button disabled={adding} className="btn btn-outline btn-sm">Agregar</button>
      </form>
      {addState.error && <p role="alert" className="text-sm text-error">{addState.error}</p>}
    </section>
  );
}
