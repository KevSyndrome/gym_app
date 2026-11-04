-- Fase 1: perfiles con rol y plan. El rol nunca viene del cliente.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '' check (char_length(full_name) <= 120),
  role text not null default 'student' check (role in ('trainer', 'student')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- Solo puede existir un entrenador.
create unique index one_trainer on public.profiles ((true)) where role = 'trainer';

alter table public.profiles enable row level security;

-- security definer para que las políticas no se llamen a sí mismas en bucle.
create function public.is_trainer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'trainer'
  );
$$;

revoke execute on function public.is_trainer() from public, anon;
grant execute on function public.is_trainer() to authenticated;

create policy "ver perfil propio o entrenador ve todos"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_trainer()));

create policy "solo el entrenador modifica perfiles"
  on public.profiles for update to authenticated
  using ((select public.is_trainer()))
  with check ((select public.is_trainer()));

-- Sin políticas de insert/delete: los perfiles los crea el trigger y se borran en cascada.
revoke all on public.profiles from anon;

-- Cada usuario nuevo (invitado) nace como alumno free. raw_user_meta_data se ignora a propósito:
-- lo controla el cliente y permitiría auto-asignarse el rol trainer.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
