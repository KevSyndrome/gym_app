begin;
select plan(6);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'coach@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'alumno1@test.local'),
  ('00000000-0000-0000-0000-00000000000c', 'alumno2@test.local');
update public.profiles set role = 'trainer' where id = '00000000-0000-0000-0000-00000000000a';

select is((select role from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'student', 'el trigger crea alumnos por defecto');

-- Como alumno 1
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);

select is((select count(*) from public.profiles)::int, 1, 'el alumno solo ve su propio perfil');

update public.profiles set role = 'trainer', plan = 'pro' where id = '00000000-0000-0000-0000-00000000000b';
select is((select role || '/' || plan from public.profiles), 'student/free',
  'el alumno no puede subirse de rol ni de plan');

select throws_ok($$ insert into public.profiles (id, email) values ('00000000-0000-0000-0000-00000000000c', 'x@test.local') $$,
  '42501', null, 'el alumno no puede insertar perfiles');

-- Como entrenador
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select is((select count(*) from public.profiles)::int, 3, 'el entrenador ve a todos');

reset role;
select throws_ok($$ update public.profiles set role = 'trainer' where id = '00000000-0000-0000-0000-00000000000c' $$,
  '23505', null, 'no puede haber dos entrenadores');

select * from finish();
rollback;
