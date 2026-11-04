# gym_app

App web (PWA) para un entrenador y sus alumnos: rutinas, horarios y progreso. Plan completo en [docs/PLAN.md](docs/PLAN.md).

## Desarrollo local

Requisitos: Node 20+, podman (o Docker).

```sh
cd web
npm install
systemctl --user start podman.socket
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
npx supabase start          # Postgres, Auth, Storage y Mailpit locales
npx supabase status -o env  # copia las claves a .env.local (ver .env.example)
npx supabase test db        # pruebas de permisos (RLS)
node --env-file=.env.local scripts/create-trainer.mjs tu@correo.com "Tu nombre"
npm run dev                 # http://127.0.0.1:3000
```

Los correos de invitación locales llegan a Mailpit: http://127.0.0.1:54324

`npx supabase stop` apaga todo; no queda nada corriendo.
