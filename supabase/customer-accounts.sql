-- Relie une commande à un compte client (nullable : les commandes existantes ou invité restent valides)
alter table orders add column if not exists customer_id uuid references auth.users(id) on delete set null;
create index if not exists idx_orders_customer_id on orders(customer_id);

-- Un client authentifié peut lire ses propres commandes (en plus des policies admin déjà en place)
drop policy if exists "customer read own orders" on orders;
create policy "customer read own orders" on orders for select
  using (customer_id = auth.uid());
