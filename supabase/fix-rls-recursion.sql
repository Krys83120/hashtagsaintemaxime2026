-- ============================================================
-- FIX : récursion infinie sur les policies RLS de admin_users
-- ============================================================

-- Fonctions "security definer" : elles s'exécutent avec les droits
-- du propriétaire de la fonction et donc CONTOURNENT le RLS,
-- ce qui casse la boucle de récursion.

create or replace function is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where id = auth.uid() and active = true
  );
$$;

create or replace function is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where id = auth.uid() and role = 'superadmin' and active = true
  );
$$;

-- Remplace les policies qui provoquaient la récursion
drop policy if exists "superadmin manage admin_users" on admin_users;
create policy "superadmin manage admin_users" on admin_users for all
  using (is_superadmin())
  with check (is_superadmin());

-- Remplace aussi les autres policies "admin write ..." pour qu'elles
-- utilisent la fonction (plus rapide et évite le même risque ailleurs)
drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories for all
  using (is_active_admin()) with check (is_active_admin());

drop policy if exists "admin write products" on products;
create policy "admin write products" on products for all
  using (is_active_admin()) with check (is_active_admin());

drop policy if exists "admin write reviews" on reviews;
create policy "admin write reviews" on reviews for all
  using (is_active_admin()) with check (is_active_admin());

drop policy if exists "admin write pages_content" on pages_content;
create policy "admin write pages_content" on pages_content for all
  using (is_active_admin()) with check (is_active_admin());

drop policy if exists "admin write media" on media;
create policy "admin write media" on media for all
  using (is_active_admin()) with check (is_active_admin());

drop policy if exists "admin write links" on links;
create policy "admin write links" on links for all
  using (is_active_admin()) with check (is_active_admin());

drop policy if exists "admin write seo_settings" on seo_settings;
create policy "admin write seo_settings" on seo_settings for all
  using (is_active_admin()) with check (is_active_admin());

drop policy if exists "admin read orders" on orders;
create policy "admin read orders" on orders for select
  using (is_active_admin());

drop policy if exists "admin write orders" on orders;
create policy "admin write orders" on orders for all
  using (is_active_admin()) with check (is_active_admin());
