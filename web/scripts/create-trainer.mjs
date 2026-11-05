// Crea la única cuenta de entrenador. Uso:
//   node --env-file=.env.local scripts/create-trainer.mjs correo@ejemplo.com "Nombre"
// Pide la contraseña por la terminal para que no quede en el historial del shell.
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";

const [email, fullName = ""] = process.argv.slice(2);
if (!email) {
  console.error("Falta el correo.");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question("Contraseña (mín. 12 caracteres): ");
rl.close();

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  console.error("No se pudo crear el usuario:", error.message);
  process.exit(1);
}

const { error: roleError } = await admin
  .from("profiles")
  .update({ role: "trainer", full_name: fullName })
  .eq("id", data.user.id);
if (roleError) {
  await admin.auth.admin.deleteUser(data.user.id);
  console.error("No se pudo asignar el rol (¿ya existe un entrenador?):", roleError.message);
  process.exit(1);
}
console.log(`Entrenador creado: ${email}`);
