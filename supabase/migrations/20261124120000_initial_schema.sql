-- Szkic schematu (docs/DATA-MODEL.md). Bez reguł cenowych, opłat i płatności (decyzje Open).
-- Wygasanie rezerwacji leniwe, bez crona (D063): hold_expires_at + funkcja expire_stale_reservations().

create extension if not exists btree_gist;

create type reservation_status as enum ('pending_payment','confirmed','cancelled','expired','completed');
create type booking_source as enum ('direct','phone','airbnb','booking','other');

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency char(3) not null default 'PLN',
  minimum_stay_nights smallint not null default 1 check (minimum_stay_nights >= 1),
  cleaning_fee_minor bigint not null default 0 check (cleaning_fee_minor >= 0),
  extra_guest_fee_minor bigint not null default 0 check (extra_guest_fee_minor >= 0),
  tax_amount_minor bigint not null default 0 check (tax_amount_minor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table amenities (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete restrict,
  blocked_during daterange not null,
  reason text,
  source text not null default 'manual',
  external_reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not isempty(blocked_during))
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  property_id uuid not null references properties(id) on delete restrict,
  status reservation_status not null default 'pending_payment',
  source booking_source not null default 'direct',
  external_reference text,
  check_in date not null,
  check_out date not null,
  stay_period daterange generated always as (daterange(check_in, check_out, '[)')) stored,
  nights_count integer generated always as (check_out - check_in) stored,
  adults_count smallint not null check (adults_count >= 1),
  children_count smallint not null default 0 check (children_count >= 0),
  guest_first_name text not null,
  guest_last_name text not null,
  guest_email text not null,
  guest_phone text not null,
  guest_message text,
  currency char(3) not null default 'PLN',
  accommodation_amount_minor bigint not null default 0 check (accommodation_amount_minor >= 0),
  cleaning_fee_minor bigint not null default 0 check (cleaning_fee_minor >= 0),
  extra_guest_fee_minor bigint not null default 0 check (extra_guest_fee_minor >= 0),
  discount_amount_minor bigint not null default 0 check (discount_amount_minor >= 0),
  tax_amount_minor bigint not null default 0 check (tax_amount_minor >= 0),
  total_amount_minor bigint not null default 0 check (total_amount_minor >= 0),
  amount_due_minor bigint not null default 0 check (amount_due_minor >= 0),
  terms_version text not null,
  privacy_version text not null,
  terms_accepted_at timestamptz not null,
  hold_expires_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in),
  check (status <> 'pending_payment' or hold_expires_at is not null),
  constraint reservations_no_active_overlap exclude using gist (
    property_id with =,
    stay_period with &&
  ) where (status in ('pending_payment', 'confirmed'))
);

create index reservations_status_hold_idx on reservations (hold_expires_at) where status = 'pending_payment';
create index calendar_blocks_property_idx on calendar_blocks using gist (property_id, blocked_during);

create trigger properties_updated_at before update on properties for each row execute function set_updated_at();
create trigger calendar_blocks_updated_at before update on calendar_blocks for each row execute function set_updated_at();
create trigger reservations_updated_at before update on reservations for each row execute function set_updated_at();

-- Leniwe wygasanie (D063): wołać przed każdym odczytem dostępności i zapisem rezerwacji.
create or replace function expire_stale_reservations() returns integer
language sql security definer set search_path = public as $$
  with expired as (
    update reservations
       set status = 'expired'
     where status = 'pending_payment' and hold_expires_at <= now()
    returning 1
  )
  select count(*)::integer from expired;
$$;
revoke all on function expire_stale_reservations() from public, anon, authenticated;
grant execute on function expire_stale_reservations() to service_role;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_profiles where user_id = auth.uid() and is_active);
$$;

-- RLS: domyślnie wszystko zamknięte; anon nie czyta rezerwacji (PII). service_role omija RLS (tylko serwer).
alter table admin_profiles enable row level security;
alter table properties enable row level security;
alter table amenities enable row level security;
alter table calendar_blocks enable row level security;
alter table reservations enable row level security;

create policy admin_profiles_self on admin_profiles for select to authenticated using (user_id = auth.uid());

create policy properties_public_read on properties for select to anon, authenticated using (true);
create policy properties_admin_write on properties for all to authenticated using (is_admin()) with check (is_admin());

create policy amenities_public_read on amenities for select to anon, authenticated using (true);
create policy amenities_admin_write on amenities for all to authenticated using (is_admin()) with check (is_admin());

create policy calendar_blocks_admin on calendar_blocks for all to authenticated using (is_admin()) with check (is_admin());
create policy reservations_admin on reservations for all to authenticated using (is_admin()) with check (is_admin());
