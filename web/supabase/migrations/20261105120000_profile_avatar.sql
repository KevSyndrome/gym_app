-- Perfil: cada usuario cambia su nombre y su foto. Rol y plan siguen siendo solo del entrenador.

alter table public.profiles add column avatar_path text check (char_length(avatar_path) <= 300);

-- Solo toca nombre y foto de quien llama; la foto debe estar en su propia carpeta.
create function public.update_my_profile(new_full_name text, new_avatar_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(trim(new_full_name)) not between 1 and 120 then
    raise exception 'El nombre debe tener entre 1 y 120 caracteres' using errcode = '22023';
  end if;
  if new_avatar_path is not null and new_avatar_path not like (select auth.uid())::text || '/%' then
    raise exception 'Foto no válida' using errcode = '42501';
  end if;
  update public.profiles
    set full_name = trim(new_full_name), avatar_path = new_avatar_path
    where id = (select auth.uid());
end;
$$;
revoke execute on function public.update_my_profile(text, text) from public, anon;
grant execute on function public.update_my_profile(text, text) to authenticated;

-- Fotos de perfil: datos personales, bucket privado. Ruta: <id del usuario>/<archivo>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "ver la foto propia o todas si es entrenador" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_trainer())));
create policy "subir la foto propia" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "cambiar la foto propia" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "borrar la foto propia" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
