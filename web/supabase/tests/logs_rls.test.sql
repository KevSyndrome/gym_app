begin;
select plan(12);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000f0', 'coach3@test.local'),
  ('00000000-0000-0000-0000-0000000000f1', 'free3@test.local'),
  ('00000000-0000-0000-0000-0000000000f2', 'pro3@test.local');
-- El entrenador real pasa a alumno solo dentro de esta transacción (rollback al final).
update public.profiles set role = 'student' where role = 'trainer';
update public.profiles set role = 'trainer' where id = '00000000-0000-0000-0000-0000000000f0';
update public.profiles set plan = 'pro' where id = '00000000-0000-0000-0000-0000000000f2';
insert into public.training_slots (student_id, day, start_time) values ('00000000-0000-0000-0000-0000000000f2', 1, '07:00');

select set_config('test.ex', (select id::text from public.exercises where name = 'Press de banca'), true);
select set_config('test.sets', jsonb_build_array(
  jsonb_build_object('exercise_id', current_setting('test.ex'), 'position', 0, 'set_number', 1, 'planned_reps', '8',
                     'planned_weight_kg', 40, 'reps', 8, 'weight_kg', 42.5, 'done', true),
  jsonb_build_object('exercise_id', current_setting('test.ex'), 'position', 0, 'set_number', 2, 'planned_reps', '8',
                     'planned_weight_kg', 40, 'reps', 0, 'done', false, 'skip_reason', 'Dolor o molestia')
)::text, true);

-- Como alumno Free
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1"}', true);

select lives_ok($$ select public.save_workout(auth.uid(), current_date, 'solo', 1::smallint, 'bien', current_setting('test.sets')::jsonb) $$,
  'el alumno Free registra su sesión');
select is((select count(*)::int from public.set_logs), 2, 'se guardan sus dos series');
select lives_ok($$ select public.save_workout(auth.uid(), current_date, 'solo', 1::smallint, 'corregido', current_setting('test.sets')::jsonb) $$,
  'registrar de nuevo el mismo día reemplaza la sesión');
select is((select count(*)::int from public.workout_sessions), 1, 'sigue habiendo una sola sesión ese día');
select throws_ok($$ select public.save_workout(auth.uid(), current_date - 1, 'trainer_absent', 1::smallint, '', '[]') $$,
  '22023', null, 'el alumno Free no puede marcar sesiones con entrenador');
select throws_ok($$ select public.save_workout(auth.uid(), current_date + 7, 'solo', 1::smallint, '', '[]') $$,
  '42501', null, 'no se puede registrar una fecha futura');
select throws_ok($$ select public.save_workout('00000000-0000-0000-0000-0000000000f2', current_date, 'solo', 1::smallint, '', '[]') $$,
  '42501', null, 'no puede registrar sesiones de otro alumno');
select is((select count(*)::int from public.training_slots), 0, 'no ve horarios de otros');
select throws_ok($$ insert into public.muscle_groups (name) values ('trampa') $$, '42501', null, 'no edita catálogos');

-- Como alumno Pro
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f2"}', true);
select is((select count(*)::int from public.workout_sessions), 0, 'el Pro no ve las sesiones del Free');
select lives_ok($$ select public.save_workout(auth.uid(), current_date, 'trainer_absent', 1::smallint, 'no llegó', '[]') $$,
  'el Pro registra que su entrenador no llegó');

-- Como entrenador
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f0"}', true);
select lives_ok($$ select public.save_workout('00000000-0000-0000-0000-0000000000f2', current_date - 1, 'with_trainer', 1::smallint, '', current_setting('test.sets')::jsonb) $$,
  'el entrenador registra la sesión de un alumno');

select * from finish();
rollback;
