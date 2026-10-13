-- STOP AT 11 campaign. Apply this migration in the linked Supabase project's SQL Editor before enabling the game.
begin;

create table if not exists public.stop11_campaigns (
  id integer primary key check (id = 1),
  claimed_count integer not null default 0 check (claimed_count >= 0),
  max_winners integer not null default 100 check (max_winners > 0),
  tolerance_ms numeric not null default 50 check (tolerance_ms >= 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.stop11_campaigns (id, claimed_count, max_winners, tolerance_ms, enabled)
values (1, 0, 100, 50, true)
on conflict (id) do nothing;

create table if not exists public.stop11_attempts (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text not null unique,
  token_nonce text not null unique,
  status text not null default 'started' check (status in ('started','submitted')),
  elapsed_ms numeric,
  is_winner boolean not null default false,
  created_at timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists stop11_attempts_created_at_idx on public.stop11_attempts(created_at desc);

create table if not exists public.stop11_winners (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.stop11_attempts(id),
  code text not null unique,
  status text not null default 'available' check (status in ('available','reserved','redeemed')),
  reserved_order_id text unique,
  reserved_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists stop11_winners_status_idx on public.stop11_winners(status);

alter table public.stop11_campaigns enable row level security;
alter table public.stop11_attempts enable row level security;
alter table public.stop11_winners enable row level security;
revoke all on public.stop11_campaigns, public.stop11_attempts, public.stop11_winners from anon, authenticated;
grant all on public.stop11_campaigns, public.stop11_attempts, public.stop11_winners to service_role;

create or replace function public.submit_stop11_attempt(
  p_attempt_id uuid, p_visitor_hash text, p_token_nonce text, p_elapsed_ms numeric, p_discount_code text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  a public.stop11_attempts%rowtype;
  c public.stop11_campaigns%rowtype;
  qualifies boolean;
begin
  select * into a from public.stop11_attempts
  where id = p_attempt_id and visitor_hash = p_visitor_hash and token_nonce = p_token_nonce
  for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'invalid_attempt'); end if;
  if a.status <> 'started' then return jsonb_build_object('ok', false, 'reason', 'already_used'); end if;

  select * into c from public.stop11_campaigns where id = 1 for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'campaign_missing'); end if;
  update public.stop11_attempts
  set status = 'submitted', elapsed_ms = p_elapsed_ms, submitted_at = now()
  where id = p_attempt_id;

  qualifies := c.enabled and abs(p_elapsed_ms - 11000) <= c.tolerance_ms;
  if not qualifies then return jsonb_build_object('ok', true, 'won', false, 'reason', 'timing'); end if;
  if c.claimed_count >= c.max_winners then return jsonb_build_object('ok', true, 'won', false, 'reason', 'sold_out'); end if;

  insert into public.stop11_winners (attempt_id, code) values (p_attempt_id, upper(p_discount_code));
  update public.stop11_attempts set is_winner = true where id = p_attempt_id;
  update public.stop11_campaigns set claimed_count = claimed_count + 1 where id = 1 returning * into c;
  return jsonb_build_object('ok', true, 'won', true, 'code', upper(p_discount_code), 'claimed_count', c.claimed_count);
end;
$$;

create or replace function public.reserve_stop11_discount(p_code text, p_order_id text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare w public.stop11_winners%rowtype;
begin
  select * into w from public.stop11_winners where code = upper(trim(p_code)) for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'invalid_code'); end if;
  if w.status = 'reserved' and w.reserved_order_id = p_order_id then return jsonb_build_object('ok', true); end if;
  if w.status <> 'available' then return jsonb_build_object('ok', false, 'reason', 'already_used'); end if;
  update public.stop11_winners set status = 'reserved', reserved_order_id = p_order_id, reserved_at = now() where id = w.id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.release_stop11_discount(p_order_id text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare affected integer;
begin
  update public.stop11_winners set status = 'available', reserved_order_id = null, reserved_at = null
  where reserved_order_id = p_order_id and status = 'reserved';
  get diagnostics affected = row_count;
  return jsonb_build_object('ok', affected = 1);
end;
$$;

create or replace function public.redeem_stop11_discount(p_order_id text) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare affected integer;
begin
  update public.stop11_winners set status = 'redeemed', redeemed_at = now()
  where reserved_order_id = p_order_id and status = 'reserved';
  get diagnostics affected = row_count;
  if affected = 1 then return jsonb_build_object('ok', true); end if;
  if exists (select 1 from public.stop11_winners where reserved_order_id = p_order_id and status = 'redeemed') then
    return jsonb_build_object('ok', true);
  end if;
  return jsonb_build_object('ok', false);
end;
$$;

revoke all on function public.submit_stop11_attempt(uuid,text,text,numeric,text) from public, anon, authenticated;
revoke all on function public.reserve_stop11_discount(text,text) from public, anon, authenticated;
revoke all on function public.release_stop11_discount(text) from public, anon, authenticated;
revoke all on function public.redeem_stop11_discount(text) from public, anon, authenticated;
grant execute on function public.submit_stop11_attempt(uuid,text,text,numeric,text) to service_role;
grant execute on function public.reserve_stop11_discount(text,text) to service_role;
grant execute on function public.release_stop11_discount(text) to service_role;
grant execute on function public.redeem_stop11_discount(text) to service_role;

commit;
