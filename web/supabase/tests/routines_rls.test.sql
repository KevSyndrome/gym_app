begin;
select plan(11);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'coach2@test.local'),
  ('00000000-0000-0000-0000-0000000000b1', 'free@test.local'),
  ('00000000-0000-0000-0000-0000000000b2', 'pro@test.local');
-- El entrenador real pasa a alumno solo dentro de esta transacción (rollback al final).
update public.profiles set role = 'student' where role = 'trainer';
update public.profiles set role = 'trainer' where id = '00000000-0000-0000-0000-0000000000a1';
update public.profiles set plan = 'pro' where id = '00000000-0000-0000-0000-0000000000b2';

insert into public.routines (id, student_id, name) values
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000b2', 'Rutina del pro');
insert into public.routine_items (routine_id, exercise_id, day, sets, reps)
  select '00000000-0000-0000-0000-0000000000c2', id, 1, 3, '10' from public.exercises limit 1;

-- Como alumno Free
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1"}', true);

select ok((select count(*) from public.exercises) >= 22, 'el alumno ve el catálogo base');
select throws_ok($$ insert into public.exercises (name, muscle_group) values ('Truco', 'core') $$,
  '42501', null, 'el alumno no puede crear ejercicios');
select is((select count(*) from public.routines where student_id is not null)::int, 0,
  'el alumno no ve la rutina de otro');
select is((select count(*) from public.routine_items where routine_id = '00000000-0000-0000-0000-0000000000c2')::int, 0,
  'el alumno no ve los ejercicios de la rutina de otro');
select ok((select count(*) from public.routines where student_id is null) >= 3, 'el alumno ve las plantillas');
select throws_ok($$ insert into public.routines (student_id, name) values (auth.uid(), 'Mía') $$,
  '42501', null, 'el alumno no crea rutinas directamente');

select lives_ok($$ select public.choose_template((select id from public.routines where name = 'Cuerpo completo, 3 días' and student_id is null)) $$,
  'el alumno Free elige una plantilla');
select is((select count(*) from public.routine_items i join public.routines r on r.id = i.routine_id
           where r.student_id = '00000000-0000-0000-0000-0000000000b1')::int, 12,
  'la plantilla se copia con todos sus ejercicios');
select lives_ok($$ select public.choose_template((select id from public.routines where name = 'En casa sin equipo' and student_id is null)) $$,
  'puede cambiar de plantilla');
select is((select count(*) from public.routines where student_id = '00000000-0000-0000-0000-0000000000b1')::int, 1,
  'cambiar de plantilla reemplaza la rutina anterior');

-- Como alumno Pro
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2"}', true);
select throws_ok($$ select public.choose_template((select id from public.routines where student_id is null limit 1)) $$,
  '42501', null, 'el alumno Pro no elige plantillas: su rutina la arma el entrenador');

select * from finish();
rollback;
