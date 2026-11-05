import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, isISODate, weekdayOf } from "./dates.ts";

test("weekdayOf: 1 = lunes, 7 = domingo", () => {
  assert.equal(weekdayOf("2026-11-02"), 1); // lunes
  assert.equal(weekdayOf("2026-11-08"), 7); // domingo
});

test("isISODate rechaza formatos raros y fechas inválidas", () => {
  assert.ok(isISODate("2026-11-05"));
  assert.ok(!isISODate("2026-13-40"));
  assert.ok(!isISODate("05/11/2026"));
  assert.ok(!isISODate("2026-11-05' or 1=1"));
});

test("addDays cruza meses", () => {
  assert.equal(addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});
