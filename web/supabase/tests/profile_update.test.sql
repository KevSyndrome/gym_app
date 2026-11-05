begin;
select plan(5);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000e1', 'yo@test.local'),
  ('00000000-0000-0000-0000-0000000000e2', 'otro@test.local');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1"}', true);

select lives_ok($$ select public.update_my_profile('  Kevin  ', '00000000-0000-0000-0000-0000000000e1/foto.jpg') $$,
  'el usuario cambia su nombre y su foto');
select is((select full_name || '|' || avatar_path || '|' || role || '|' || plan from public.profiles),
  'Kevin|00000000-0000-0000-0000-0000000000e1/foto.jpg|student|free', 'solo cambian nombre y foto; rol y plan quedan igual');
select throws_ok($$ select public.update_my_profile('Kevin', '00000000-0000-0000-0000-0000000000e2/foto.jpg') $$,
  '42501', null, 'no puede apuntar a la foto de otro usuario');
select throws_ok($$ select public.update_my_profile('   ', null) $$,
  '22023', null, 'el nombre no puede quedar vacío');

reset role;
select is((select full_name from public.profiles where id = '00000000-0000-0000-0000-0000000000e2'), '',
  'el perfil de otro usuario no cambia');

select * from finish();
rollback;
