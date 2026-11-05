import assert from "node:assert/strict";
import { test } from "node:test";
import { readImage } from "./images.ts";

const file = (bytes: number[], type: string, size?: number) => {
  const f = new File([new Uint8Array(bytes)], "x", { type });
  return size ? Object.defineProperty(f, "size", { value: size }) : f;
};
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPG = [0xff, 0xd8, 0xff, 0xe0];
const WEBP = [...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP")];

test("acepta JPG, PNG y WEBP reales", async () => {
  assert.equal((await readImage(file(JPG, "image/jpeg")) as { ext: string }).ext, "jpg");
  assert.equal((await readImage(file(PNG, "image/png")) as { ext: string }).ext, "png");
  assert.equal((await readImage(file(WEBP, "image/webp")) as { ext: string }).ext, "webp");
});

test("rechaza un archivo que dice ser imagen pero no lo es", async () => {
  const html = [...Buffer.from("<script>alert(1)</script>")];
  assert.ok("error" in (await readImage(file(html, "image/png"))));
});

test("rechaza una imagen real con tipo cambiado o no permitido", async () => {
  assert.ok("error" in (await readImage(file(PNG, "image/jpeg"))));
  assert.ok("error" in (await readImage(file(PNG, "image/svg+xml"))));
});

test("rechaza más de 2 MB", async () => {
  assert.ok("error" in (await readImage(file(PNG, "image/png", 2 * 1024 * 1024 + 1))));
});
