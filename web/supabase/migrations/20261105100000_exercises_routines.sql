-- Fase 2: catálogo de ejercicios, rutinas (plantillas Free y personales Pro) y sus ejercicios por día.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  muscle_group text not null check (muscle_group in
    ('pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'core', 'cuerpo completo')),
  description text not null default '' check (char_length(description) <= 2000),
  image_path text check (char_length(image_path) <= 300),
  created_at timestamptz not null default now()
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  -- null = plantilla que los alumnos Free pueden elegir.
  student_id uuid references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  created_at timestamptz not null default now()
);
-- Una rutina vigente por alumno: si cambia, se edita esa.
create unique index one_routine_per_student on public.routines (student_id) where student_id is not null;

create table public.routine_items (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  day smallint not null check (day between 1 and 7), -- 1 = lunes
  position smallint not null default 0,
  sets smallint not null check (sets between 1 and 20),
  reps text not null check (char_length(reps) between 1 and 20), -- "10", "8-12", "al fallo"
  weight_kg numeric(5, 1) check (weight_kg between 0 and 999),
  rest_seconds smallint check (rest_seconds between 0 and 900),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);
create index on public.routine_items (routine_id);
create index on public.routine_items (exercise_id);

alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_items enable row level security;
revoke all on public.exercises, public.routines, public.routine_items from anon;

create policy "todos ven el catálogo" on public.exercises for select to authenticated using (true);
create policy "el entrenador edita el catálogo" on public.exercises for all to authenticated
  using ((select private.is_trainer())) with check ((select private.is_trainer()));

create policy "ver plantillas, la propia o todas si es entrenador" on public.routines for select to authenticated
  using (student_id is null or student_id = (select auth.uid()) or (select private.is_trainer()));
create policy "el entrenador edita rutinas" on public.routines for all to authenticated
  using ((select private.is_trainer())) with check ((select private.is_trainer()));

-- La subconsulta pasa por la RLS de routines: solo ves ítems de rutinas que puedes ver.
create policy "ver ítems de rutinas visibles" on public.routine_items for select to authenticated
  using (exists (select 1 from public.routines r where r.id = routine_id));
create policy "el entrenador edita ítems" on public.routine_items for all to authenticated
  using ((select private.is_trainer())) with check ((select private.is_trainer()));

-- El alumno Free elige una plantilla: se copia como su rutina (reemplaza la anterior).
create function public.choose_template(template_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if not exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'student' and plan = 'free') then
    raise exception 'Solo los alumnos del plan Free eligen plantillas' using errcode = '42501';
  end if;
  if not exists (select 1 from public.routines where id = template_id and student_id is null) then
    raise exception 'Plantilla no encontrada' using errcode = 'P0002';
  end if;

  delete from public.routines where student_id = (select auth.uid());
  insert into public.routines (student_id, name, description)
    select (select auth.uid()), name, description from public.routines where id = template_id
    returning id into new_id;
  insert into public.routine_items (routine_id, exercise_id, day, position, sets, reps, weight_kg, rest_seconds, notes)
    select new_id, exercise_id, day, position, sets, reps, weight_kg, rest_seconds, notes
    from public.routine_items where routine_id = template_id;
  return new_id;
end;
$$;
revoke execute on function public.choose_template(uuid) from public, anon;
grant execute on function public.choose_template(uuid) to authenticated;

-- Imágenes de ejercicios: no son datos personales, así que el bucket es público de lectura.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('exercise-images', 'exercise-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "el entrenador sube imágenes" on storage.objects for insert to authenticated
  with check (bucket_id = 'exercise-images' and (select private.is_trainer()));
create policy "el entrenador cambia imágenes" on storage.objects for update to authenticated
  using (bucket_id = 'exercise-images' and (select private.is_trainer()));
create policy "el entrenador borra imágenes" on storage.objects for delete to authenticated
  using (bucket_id = 'exercise-images' and (select private.is_trainer()));
