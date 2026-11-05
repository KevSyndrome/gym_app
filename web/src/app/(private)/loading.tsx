// Límite de carga de todas las páginas privadas: muestra esto mientras llegan los datos del usuario.
export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center p-6" role="status">
      <span className="loading loading-spinner loading-lg text-primary" aria-label="Cargando" />
    </main>
  );
}
