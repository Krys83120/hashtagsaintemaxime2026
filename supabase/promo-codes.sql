create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null,
  active boolean default true,
  expires_at timestamptz,
  min_order_amount numeric(10,2) default 0,
  usage_limit int,
  usage_count int default 0,
  created_at timestamptz default now()
);

alter table promo_codes enable row level security;

drop policy if exists "public read active promo_codes" on promo_codes;
create policy "public read active promo_codes" on promo_codes for select
  using (active = true);

drop policy if exists "admin write promo_codes" on promo_codes;
create policy "admin write promo_codes" on promo_codes for all
  using (is_active_admin())
  with check (is_active_admin());

-- Code de lancement, en écho au bandeau du site ("Code : ETE2026")
insert into promo_codes (code, discount_type, discount_value, min_order_amount)
values ('ETE2026', 'percent', 10, 30)
on conflict (code) do nothing;

alter table orders add column if not exists promo_code text;
alter table orders add column if not exists discount_amount numeric(10,2) default 0;
