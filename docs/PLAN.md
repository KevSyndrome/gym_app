# Plan — gym_app

## Decisiones
- Plataforma: web responsive / PWA.
- Stack: Next.js (TypeScript) + Supabase (Auth, Postgres con RLS, Storage) + Tailwind/daisyUI (tema propio "gym").
- Un solo entrenador.
- Pagos: Stripe en modo test (gratis, sin cobros reales) hasta salir a producción.

## Roles
- **Entrenador**: registra alumnos (por invitación), horarios, rutinas (ejercicio, descripción, imagen, sets, reps, peso), ve progreso.
- **Alumno Pro**: ve su rutina semanal resumida; registra sus sesiones autónomas.
- **Alumno Free**: se registra solo, elige una rutina plantilla (se copia como suya) y lleva su seguimiento sin entrenador.

## Modelo de datos (borrador)
- `profiles` (id = auth.users.id, nombre, rol: trainer|student, plan: free|pro)
- `exercises` (nombre, descripción, imagen, grupo muscular)
- `routines` (alumno o null si es plantilla free, nombre, semana)
- `routine_items` (rutina, ejercicio, día, orden, sets, reps, peso objetivo, descanso, notas)
- `sessions` (alumno, fecha/hora, modo: con_entrenador|autonoma, estado)
- `set_logs` (sesión, routine_item, n° set, reps reales, peso real, completado, motivo si se omitió, registrado_por)
- `subscriptions` (alumno, plan, estado, stripe_customer_id, stripe_subscription_id)

Planificado (`routine_items`) y realizado (`set_logs`) se guardan separados; el progreso es la comparación.

## Pendientes de infraestructura
- **SMTP propio** (o la API de correo del usuario): hoy el entrenador copia el enlace de invitación y lo comparte a mano; con SMTP se enviará además por correo y en español.
  Al tenerlo, volver a la plantilla con `token_hash` verificada en servidor en vez del flujo con `#hash` (`/auth/accept`).
- **Recuperar contraseña**: no existe todavía.

## Estado
- Fase 1 (auth, roles, invitación): hecha.
- Fase 2 (ejercicios, rutinas, vista del alumno, plantillas Free, portada con planes): hecha. El registro público
  existe pero está cerrado hasta tener SMTP (confirmación de correo).

## Fases
1. Auth, roles, invitación de alumnos.
2. Ejercicios + rutinas + vista del alumno.
3. Horarios.
4. Registro de sesiones + gráficas de progreso.
5. Landing pública, planes Free/Pro, Stripe (test).
6. Hardening: MFA (TOTP) para el entrenador, CSP con nonce, tests, CI, escaneo de dependencias.

## Seguridad (meta: OWASP ASVS L2)
- RLS en todas las tablas: el alumno solo accede a sus filas (evita IDOR).
- Login con límite de intentos; MFA para el entrenador.
- Validación de entrada en servidor (zod); imágenes de ejercicios: firma real del archivo (JPG/PNG/WEBP), máx. 2 MB, bucket público de lectura (no son datos personales) y escritura solo del entrenador.
- Cabeceras de seguridad (CSP, HSTS), secretos solo en variables de entorno.
- Sin datos de tarjeta en nuestro sistema (Stripe Checkout); webhooks verificados por firma.
- Datos de salud/progreso = datos personales: cumplir ley de protección de datos local.
- ISO 27001: aplicamos controles técnicos (acceso, auditoría, respaldos, gestión de cambios vía Git/PR), no es una certificación del código.
