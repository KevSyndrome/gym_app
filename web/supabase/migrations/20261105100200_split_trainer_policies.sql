-- Una sola política de lectura por tabla (aviso de rendimiento multiple_permissive_policies):
-- la escritura del entrenador se separa en insert/update/delete.
drop policy "el entrenador edita el catálogo" on public.exercises;
drop policy "el entrenador edita rutinas" on public.routines;
drop policy "el entrenador edita ítems" on public.routine_items;

create policy "entrenador crea ejercicios" on public.exercises for insert to authenticated with check ((select private.is_trainer()));
create policy "entrenador edita ejercicios" on public.exercises for update to authenticated using ((select private.is_trainer())) with check ((select private.is_trainer()));
create policy "entrenador borra ejercicios" on public.exercises for delete to authenticated using ((select private.is_trainer()));

create policy "entrenador crea rutinas" on public.routines for insert to authenticated with check ((select private.is_trainer()));
create policy "entrenador edita rutinas" on public.routines for update to authenticated using ((select private.is_trainer())) with check ((select private.is_trainer()));
create policy "entrenador borra rutinas" on public.routines for delete to authenticated using ((select private.is_trainer()));

create policy "entrenador crea ítems" on public.routine_items for insert to authenticated with check ((select private.is_trainer()));
create policy "entrenador edita ítems" on public.routine_items for update to authenticated using ((select private.is_trainer())) with check ((select private.is_trainer()));
create policy "entrenador borra ítems" on public.routine_items for delete to authenticated using ((select private.is_trainer()));
