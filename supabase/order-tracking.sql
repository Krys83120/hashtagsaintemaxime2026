alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists carrier text;
alter table orders add column if not exists shipped_at timestamptz;
alter table orders add column if not exists tracking_token uuid default gen_random_uuid() unique;

-- S'assure que les commandes existantes ont bien un token (pour celles créées avant cette colonne)
update orders set tracking_token = gen_random_uuid() where tracking_token is null;
