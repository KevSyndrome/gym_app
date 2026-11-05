-- Registro público (plan Free): el nombre viene del formulario. Del metadata del cliente solo se toma
-- el nombre, recortado; rol y plan siguen fijos (student/free) para que nadie se auto-asigne privilegios.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120));
  return new;
end;
$$;
