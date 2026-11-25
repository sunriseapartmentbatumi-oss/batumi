-- OPCJONALNA migracja: dziennik zdarzeń formularza/akcji dla /admin/diagnostyka (metryki, ostatnie błędy).
-- Aplikacja działa bez tej tabeli (zapis zdarzeń jest best effort). Nie przechowuje danych osobowych gości.
create table if not exists app_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null,
  operation text not null,
  detail jsonb not null default '{}'::jsonb
);

create index if not exists app_events_created_at_idx on app_events (created_at desc);
create index if not exists app_events_kind_idx on app_events (kind, created_at desc);

alter table app_events enable row level security;

-- Zapis tylko przez service_role (omija RLS); odczyt tylko dla administratorów.
drop policy if exists app_events_admin_read on app_events;
create policy app_events_admin_read on app_events for select to authenticated using (is_admin());
