# gym_app

App web (PWA) para un entrenador y sus alumnos: rutinas, horarios y progreso. Plan completo en [docs/PLAN.md](docs/PLAN.md).

## Desarrollo

Requisitos: Node 20+ y un proyecto de Supabase (plan free sirve). La base de datos corre en la nube:
podman 6.1 no puede levantar Supabase local (bug con `PidsLimit: 0`).

```sh
cd web
npm install
cp .env.example .env.local      # URL y claves de Project Settings → API Keys
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push --remote   # aplica supabase/migrations
npx supabase config push        # auth: registro cerrado, contraseña >= 12, MFA
npm test                        # pruebas unitarias
npm run test:db                 # pruebas de permisos (RLS), no dejan datos
npm run db:types                # regenera los tipos de la base tras cada migración
node --env-file=.env.local scripts/create-trainer.mjs tu@correo.com "Tu nombre"
npm run dev                     # http://127.0.0.1:3000
```

Con el correo integrado de Supabase las invitaciones solo llegan a miembros del equipo del proyecto
y hay un límite de ~2 correos por hora. Para invitar alumnos reales hace falta SMTP propio (ver docs/PLAN.md).
