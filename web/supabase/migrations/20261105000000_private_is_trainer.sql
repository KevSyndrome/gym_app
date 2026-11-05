-- is_trainer() solo la usan las políticas RLS: fuera del esquema expuesto por la API (/rest/v1/rpc).
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated; -- las políticas se evalúan con el rol de quien consulta

alter function public.is_trainer() set schema private; -- las políticas siguen apuntando a ella (por OID)
