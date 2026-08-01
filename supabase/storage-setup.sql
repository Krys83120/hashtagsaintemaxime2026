-- ============================================================
-- Bucket de stockage "media" pour les images/logos uploadés
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Lecture publique (le site doit pouvoir afficher les images)
drop policy if exists "public read media bucket" on storage.objects;
create policy "public read media bucket" on storage.objects for select
  using (bucket_id = 'media');

-- Upload/suppression réservés aux admins actifs
drop policy if exists "admin write media bucket" on storage.objects;
create policy "admin write media bucket" on storage.objects for all
  using (bucket_id = 'media' and is_active_admin())
  with check (bucket_id = 'media' and is_active_admin());
