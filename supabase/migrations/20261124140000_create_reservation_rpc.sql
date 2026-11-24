-- Atomowe tworzenie rezerwacji oczekującej (D063): wygasa stare blokady, sprawdza calendar_blocks,
-- a nakładanie na aktywne rezerwacje blokuje constraint reservations_no_active_overlap.
create or replace function create_pending_reservation(
  p_reference text,
  p_check_in date,
  p_check_out date,
  p_adults smallint,
  p_children smallint,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_message text,
  p_terms_version text,
  p_privacy_version text,
  p_hold_minutes integer
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_property uuid;
  v_min smallint;
  v_id uuid;
begin
  select id, minimum_stay_nights into v_property, v_min from properties order by created_at limit 1;
  if v_property is null then
    raise exception 'no_property' using errcode = 'P0001';
  end if;
  if p_check_out - p_check_in < v_min then
    raise exception 'min_stay' using errcode = 'P0001';
  end if;

  perform expire_stale_reservations();

  if exists (
    select 1 from calendar_blocks
    where property_id = v_property and blocked_during && daterange(p_check_in, p_check_out, '[)')
  ) then
    raise exception 'dates_unavailable' using errcode = 'P0001';
  end if;

  begin
    insert into reservations (
      reference, property_id, check_in, check_out, adults_count, children_count,
      guest_first_name, guest_last_name, guest_email, guest_phone, guest_message,
      terms_version, privacy_version, terms_accepted_at, hold_expires_at
    ) values (
      p_reference, v_property, p_check_in, p_check_out, p_adults, p_children,
      p_first_name, p_last_name, p_email, p_phone, p_message,
      p_terms_version, p_privacy_version, now(), now() + make_interval(mins => p_hold_minutes)
    ) returning id into v_id;
  exception when exclusion_violation then
    raise exception 'dates_unavailable' using errcode = 'P0001';
  end;
  return v_id;
end;
$$;
revoke all on function create_pending_reservation(text,date,date,smallint,smallint,text,text,text,text,text,text,text,integer) from public, anon, authenticated;
grant execute on function create_pending_reservation(text,date,date,smallint,smallint,text,text,text,text,text,text,text,integer) to service_role;

-- Publiczna dostępność bez PII: tylko zakresy zajęte (aktywne rezerwacje + blokady).
create or replace function get_unavailable_ranges()
returns table (check_in date, check_out date)
language sql security definer set search_path = public as $$
  select lower(stay_period), upper(stay_period) from reservations
   where status = 'confirmed' or (status = 'pending_payment' and hold_expires_at > now())
  union all
  select lower(blocked_during), upper(blocked_during) from calendar_blocks;
$$;
revoke all on function get_unavailable_ranges() from public, anon, authenticated;
grant execute on function get_unavailable_ranges() to service_role;
