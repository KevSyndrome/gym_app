import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { CATALOGS, getCatalog, type CatalogTable } from "@/lib/routine";
import { CatalogEditor } from "./catalog-editor";

const HELP: Record<CatalogTable, string> = {
  muscle_groups: "Para agrupar ejercicios. No se puede borrar uno que tenga ejercicios.",
  equipment: "Lo que necesita cada ejercicio. Si lo borras, sus ejercicios quedan sin especificar.",
  skip_reasons: "Opciones que ve el alumno cuando no hace un ejercicio.",
};

export default async function CatalogsPage() {
  const { supabase, profile } = await requireUser("trainer");
  const tables = Object.keys(CATALOGS) as CatalogTable[];
  const items = await Promise.all(tables.map((t) => getCatalog(supabase, t)));

  return (
    <>
      <Header name={profile.full_name || profile.email} role="trainer" current="/trainer/catalogos" />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="title">Catálogos</h1>
          <p className="mt-2 text-muted">Las listas que se usan en ejercicios y registros. Ajústalas a tu forma de entrenar.</p>
        </div>
        <div className="grid items-start gap-6 md:grid-cols-3">
          {tables.map((t, i) => (
            <CatalogEditor key={t} table={t} title={CATALOGS[t]} help={HELP[t]} items={items[i]} />
          ))}
        </div>
      </main>
    </>
  );
}
