-- Automatyczny admin dla jednego adresu e-mail (bez haseł w repo). Konto tworzy się ręcznie w Supabase Auth (Add/Invite user).
create or replace function bootstrap_admin_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'sunriseapartmentbatumi@gmail.com' then
    insert into public.admin_profiles (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists bootstrap_admin_on_signup on auth.users;
create trigger bootstrap_admin_on_signup
  after insert on auth.users
  for each row execute function bootstrap_admin_profile();

insert into admin_profiles (user_id)
select id from auth.users where lower(email) = 'sunriseapartmentbatumi@gmail.com'
on conflict do nothing;
