import Image from "next/image";
import type { ReactNode } from "react";
import { DAYS, byDay, describeItem, imageUrl, type RoutineItem } from "@/lib/routine";

export function RoutineWeek({
  items,
  itemAction,
  empty = "Esta rutina todavía no tiene ejercicios.",
}: {
  items: RoutineItem[];
  itemAction?: (item: RoutineItem) => ReactNode;
  empty?: string;
}) {
  const days = byDay(items);
  if (!days.size) return <p className="rounded-box border border-dashed border-base-300 p-6 text-center text-muted">{empty}</p>;

  return (
    <div className="flex flex-col gap-4">
      {[...days].map(([day, dayItems]) => (
        <section key={day} className="rounded-box border border-base-300 bg-base-200">
          <h3 className="flex items-baseline justify-between border-b border-base-300 px-4 py-3">
            <span className="font-display text-2xl font-bold">{DAYS[day - 1]}</span>
            <span className="text-sm text-muted">{dayItems.length} ejercicios</span>
          </h3>
          <ul className="divide-y divide-base-300">
            {dayItems.map((item) => {
              const src = imageUrl(item.exercise.image_path);
              return (
                <li key={item.id} className="flex gap-4 px-4 py-3">
                  {src && (
                    <Image src={src} alt="" width={64} height={64} className="size-16 shrink-0 rounded-field object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="font-medium">{item.exercise.name}</p>
                      <p className="font-display text-xl text-primary">{describeItem(item)}</p>
                    </div>
                    <p className="text-sm text-muted">
                      {item.rest_seconds != null && `Descanso ${item.rest_seconds} s`}
                      {item.rest_seconds != null && item.notes && ". "}
                      {item.notes}
                    </p>
                    {item.exercise.description && (
                      <details className="mt-1 text-sm">
                        <summary className="cursor-pointer text-muted hover:text-base-content">Cómo se hace</summary>
                        <p className="mt-1 max-w-prose">{item.exercise.description}</p>
                      </details>
                    )}
                  </div>
                  {itemAction?.(item)}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
