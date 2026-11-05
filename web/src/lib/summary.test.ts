import assert from "node:assert/strict";
import { test } from "node:test";
import { summarize, type SetRow } from "./summary.ts";

const set = (o: Partial<SetRow>): SetRow => ({
  exercise_id: "e", position: 0, set_number: 1, planned_reps: "10", planned_weight_kg: 60,
  reps: 10, weight_kg: 60, done: true, skip_reason: null, exercise: { name: "Sentadilla" }, ...o,
});

test("igual al plan: no marca cambio", () => {
  const r = summarize([set({}), set({ set_number: 2 })]);
  assert.deepEqual(r, { plan: "2 × 10 a 60 kg", done: "2 × 10 a 60 kg", changed: false });
});

test("más peso y menos repeticiones: marca cambio", () => {
  const r = summarize([set({ reps: 8, weight_kg: 65 }), set({ set_number: 2, reps: 8, weight_kg: 65 })]);
  assert.equal(r.done, "2 × 8 a 65 kg");
  assert.equal(r.changed, true);
});

test("series distintas se listan una por una", () => {
  const r = summarize([set({}), set({ set_number: 2, reps: 8, weight_kg: 62.5 })]);
  assert.equal(r.done, "10×60, 8×62,5 kg");
});

test("no lo hizo: muestra el motivo", () => {
  const r = summarize([set({ done: false, reps: null, skip_reason: "Dolor o molestia" })]);
  assert.deepEqual(r, { plan: "1 × 10 a 60 kg", done: "No lo hizo: dolor o molestia", changed: true });
});

test("hizo menos series de las planeadas", () => {
  const r = summarize([set({}), set({ set_number: 2, done: false })]);
  assert.equal(r.done, "1 × 10 a 60 kg (1 sin hacer)");
  assert.equal(r.changed, true);
});

test("repeticiones en rango (8-12) no se marcan como cambio por sí solas", () => {
  const r = summarize([set({ planned_reps: "8-12", reps: 9 })]);
  assert.equal(r.changed, false);
});
