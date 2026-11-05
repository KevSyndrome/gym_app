/* eslint-disable @next/next/no-img-element -- foto privada con URL firmada: no pasa por el optimizador para no cachearla en el servidor */
export function Avatar({ name, url, size = "size-10" }: { name: string; url?: string | null; size?: string }) {
  return url ? (
    <img src={url} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <span aria-hidden className={`${size} grid shrink-0 place-items-center rounded-full bg-base-300 font-display text-lg font-bold`}>
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}
