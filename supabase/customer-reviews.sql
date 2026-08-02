drop policy if exists "customer insert own review" on reviews;
create policy "customer insert own review" on reviews for insert
  with check (auth.uid() is not null);
