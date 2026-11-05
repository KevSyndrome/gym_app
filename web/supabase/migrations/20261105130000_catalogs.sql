-- Catálogos editables por el entrenador: grupos musculares, equipo y motivos para no hacer un ejercicio.

create table public.muscle_groups (
  name text primary key check (char_length(name) between 1 and 40),
  position smallint not null default 0
);
create table public.equipment (
  name text primary key check (char_length(name) between 1 and 40),
  position smallint not null default 0
);
create table public.skip_reasons (
  name text primary key check (char_length(name) between 1 and 80),
  position smallint not null default 0
);

insert into public.muscle_groups (name, position) values
  ('pecho', 1), ('espalda', 2), ('piernas', 3), ('hombros', 4), ('brazos', 5), ('core', 6), ('cuerpo completo', 7);
insert into public.equipment (name, position) values
  ('barra', 1), ('mancuernas', 2), ('máquina', 3), ('polea', 4), ('banco', 5), ('peso corporal', 6);
insert into public.skip_reasons (name, position) values
  ('Dolor o molestia', 1), ('Cansancio', 2), ('Falta de tiempo', 3), ('Máquina o equipo ocupado', 4), ('Otro', 5);

-- El grupo muscular pasa de lista fija a catálogo; renombrar un grupo actualiza sus ejercicios.
alter table public.exercises drop constraint exercises_muscle_group_check;
alter table public.exercises add constraint exercises_muscle_group_fkey
  foreign key (muscle_group) references public.muscle_groups (name) on update cascade on delete restrict;
alter table public.exercises add column equipment text
  references public.equipment (name) on update cascade on delete set null;
create index on public.exercises (equipment);

update public.exercises set equipment = v.eq from (values
  ('Sentadilla con barra', 'barra'), ('Peso muerto', 'barra'), ('Peso muerto rumano', 'barra'),
  ('Prensa de piernas', 'máquina'), ('Zancadas', 'peso corporal'), ('Elevación de talones', 'peso corporal'),
  ('Hip thrust', 'barra'), ('Press de banca', 'barra'), ('Press inclinado con mancuernas', 'mancuernas'),
  ('Flexiones', 'peso corporal'), ('Aperturas con mancuernas', 'mancuernas'), ('Dominadas', 'peso corporal'),
  ('Jalón al pecho', 'polea'), ('Remo con barra', 'barra'), ('Remo con mancuerna', 'mancuernas'),
  ('Press militar', 'barra'), ('Elevaciones laterales', 'mancuernas'), ('Curl de bíceps con barra', 'barra'),
  ('Extensión de tríceps en polea', 'polea'), ('Fondos en paralelas', 'peso corporal'),
  ('Plancha', 'peso corporal'), ('Crunch abdominal', 'peso corporal')
) as v(name, eq) where exercises.name = v.name;

do $$
declare t text;
begin
  foreach t in array array['muscle_groups', 'equipment', 'skip_reasons'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('create policy "todos leen el catálogo" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "entrenador agrega" on public.%I for insert to authenticated with check ((select private.is_trainer()))', t);
    execute format('create policy "entrenador edita" on public.%I for update to authenticated using ((select private.is_trainer())) with check ((select private.is_trainer()))', t);
    execute format('create policy "entrenador borra" on public.%I for delete to authenticated using ((select private.is_trainer()))', t);
  end loop;
end $$;
