import "server-only";

const TYPES: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/webp": {
    ext: "webp",
    magic: (b) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  },
};
const MAX = 2 * 1024 * 1024;

// Valida una imagen subida. El tipo que declara el navegador no basta: se comprueba la firma real del archivo.
export async function readImage(file: File): Promise<{ bytes: Uint8Array; ext: string; type: string } | { error: string }> {
  if (file.size > MAX) return { error: "La imagen pesa más de 2 MB." };
  const type = TYPES[file.type];
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type || !type.magic(bytes)) return { error: "La imagen debe ser JPG, PNG o WEBP." };
  return { bytes, ext: type.ext, type: file.type };
}
