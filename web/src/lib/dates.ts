// "Hoy" depende de la zona del gimnasio, no de la del servidor (que suele estar en UTC).
export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE || "America/Mexico_City";

/** Fecha de hoy en la zona del gimnasio, como YYYY-MM-DD. */
export const todayISO = () => new Date().toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

/** 1 = lunes ... 7 = domingo, igual que en la base de datos. */
export const weekdayOf = (iso: string) => ((new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

export const isISODate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00Z`));

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export const formatTime = (time: string) => time.slice(0, 5);

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
