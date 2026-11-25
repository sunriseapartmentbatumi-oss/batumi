-- Znacznik wysłania przypomnienia o zameldowaniu (idempotencja crona). Cron ustawia go po udanej wysyłce.
alter table reservations add column if not exists reminder_sent_at timestamptz;

create index if not exists reservations_reminder_due_idx
  on reservations (check_in)
  where status = 'confirmed' and reminder_sent_at is null;
