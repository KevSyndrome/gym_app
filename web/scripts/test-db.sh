#!/usr/bin/env bash
# Corre supabase/tests/*.test.sql contra el proyecto enlazado.
# shortcut: `supabase test db` usa un contenedor que podman 6.1 rompe (PidsLimit=0); volver a él cuando se arregle.
# Cada archivo corre en una transacción con rollback: no deja datos ni la extensión pgtap.
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0
for f in supabase/tests/*.test.sql; do
  sql=$(sed '0,/^begin;/s//begin;\ncreate extension if not exists pgtap with schema extensions;\nset local search_path = public, extensions;\ncreate temp table tap_out (n serial, line text);\ngrant all on tap_out, tap_out_n_seq to authenticated;/' "$f" \
    | sed -E 's/^select (is|isnt|ok|throws_ok|lives_ok|plan)\(/insert into tap_out (line) select \1(/; s/^select \* from finish\(\);/insert into tap_out (line) select * from finish();\nselect line from tap_out order by n;/')
  echo "# $f"
  out=$(npx supabase db query --remote --yes "$sql" 2>&1 | grep -v "npm notice")
  lines=$(node -e 'const t=require("fs").readFileSync(0,"utf8");try{for(const r of JSON.parse(t.slice(t.indexOf("{"))).rows)console.log(r.line)}catch{console.log("ERROR "+t.slice(-800))}' <<<"$out")
  echo "$lines"
  grep -qE '^(not ok|ERROR|# Looks like)' <<<"$lines" && fail=1
done
exit $fail
