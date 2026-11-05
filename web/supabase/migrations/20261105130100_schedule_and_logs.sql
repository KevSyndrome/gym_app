-- Fase 3: horarios semanales del entrenador con cada alumno.
create table public.training_slots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  day smallint not null check (day between 1 and 7), -- 1 = lunes
  start_time time not null,
  duration_min smallint not null default 60 check (duration_min between 15 and 240),
  notes text not null default '' check (char_length(notes) <= 200),
  created_at timestamptz not null default now()
);
create index on public.training_slots (student_id);

alter table public.training_slots enable row level security;
revoke all on public.training_slots from anon;
create policy "ver el horario propio o todos si es entrenador" on public.training_slots for select to authenticated
  using (student_id = (select auth.uid()) or (select private.is_trainer()));
create policy "entrenador crea horarios" on public.training_slots for insert to authenticated with check ((select private.is_trainer()));
create policy "entrenador edita horarios" on public.training_slots for update to authenticated
  using ((select private.is_trainer())) with check ((select private.is_trainer()));
create policy "entrenador borra horarios" on public.training_slots for delete to authenticated using ((select private.is_trainer()));

-- Fase 4: lo que de verdad se hizo. Una sesión por alumno y fecha; una fila por serie.
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  routine_day smallint check (routine_day between 1 and 7),
  -- with_trainer: con el entrenador; trainer_absent: el entrenador no llegó; solo: sin entrenador.
  mode text not null check (mode in ('with_trainer', 'trainer_absent', 'solo')),
  notes text not null default '' check (char_length(notes) <= 1000),
  logged_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (student_id, date)
);

create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position smallint not null default 0,
  set_number smallint not null check (set_number between 1 and 20),
  -- Copia del plan al momento de registrar: si la rutina cambia después, el historial no se altera.
  planned_reps text check (char_length(planned_reps) <= 20),
  planned_weight_kg numeric(5, 1),
  reps smallint check (reps between 0 and 500),
  weight_kg numeric(5, 1) check (weight_kg between 0 and 999),
  done boolean not null default true,
  skip_reason text check (char_length(skip_reason) <= 200),
  unique (session_id, exercise_id, set_number)
);
create index on public.set_logs (exercise_id);

alter table public.workout_sessions enable row level security;
alter table public.set_logs enable row level security;
revoke all on public.workout_sessions, public.set_logs from anon;

create policy "ver sesiones propias o todas si es entrenador" on public.workout_sessions for select to authenticated
  using (student_id = (select auth.uid()) or (select private.is_trainer()));
-- Se puede registrar hoy o días pasados, no el futuro (+1 día de margen por zona horaria).
create policy "registrar sesión propia o de un alumno si es entrenador" on public.workout_sessions for insert to authenticated
  with check ((student_id = (select auth.uid()) or (select private.is_trainer())) and date <= current_date + 1);
create policy "editar sesión propia o de un alumno si es entrenador" on public.workout_sessions for update to authenticated
  using (student_id = (select auth.uid()) or (select private.is_trainer()))
  with check ((student_id = (select auth.uid()) or (select private.is_trainer())) and date <= current_date + 1);
create policy "borrar sesión propia o de un alumno si es entrenador" on public.workout_sessions for delete to authenticated
  using (student_id = (select auth.uid()) or (select private.is_trainer()));

-- La subconsulta pasa por la RLS de workout_sessions.
create policy "ver series de sesiones visibles" on public.set_logs for select to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id));
create policy "escribir series de sesiones propias" on public.set_logs for insert to authenticated
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id));
create policy "borrar series de sesiones propias" on public.set_logs for delete to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id));

-- Guarda una sesión completa de una vez (reemplaza la del mismo día). Corre con los permisos de quien
-- llama (security invoker): la RLS decide si puede registrar para ese alumno.
create function public.save_workout(
  p_student uuid, p_date date, p_mode text, p_routine_day smallint, p_notes text, p_sets jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_session uuid;
begin
  if p_mode <> 'solo' and (select plan from public.profiles where id = p_student) = 'free' then
    raise exception 'En el plan gratuito se entrena sin entrenador' using errcode = '22023';
  end if;

  insert into public.workout_sessions as s (student_id, date, routine_day, mode, notes, logged_by)
  values (p_student, p_date, p_routine_day, p_mode, coalesce(p_notes, ''), (select auth.uid()))
  on conflict (student_id, date) do update
    set routine_day = excluded.routine_day, mode = excluded.mode, notes = excluded.notes,
        logged_by = excluded.logged_by, updated_at = now()
  returning s.id into v_session;

  delete from public.set_logs where set_logs.session_id = v_session;
  insert into public.set_logs
    (session_id, exercise_id, position, set_number, planned_reps, planned_weight_kg, reps, weight_kg, done, skip_reason)
  select v_session, x.exercise_id, x.position, x.set_number, x.planned_reps, x.planned_weight_kg,
         x.reps, x.weight_kg, x.done, nullif(x.skip_reason, '')
  from jsonb_to_recordset(p_sets) as x(
    exercise_id uuid, position smallint, set_number smallint, planned_reps text, planned_weight_kg numeric,
    reps smallint, weight_kg numeric, done boolean, skip_reason text
  );
  return v_session;
end;
$$;
revoke execute on function public.save_workout(uuid, date, text, smallint, text, jsonb) from public, anon;
grant execute on function public.save_workout(uuid, date, text, smallint, text, jsonb) to authenticated;
