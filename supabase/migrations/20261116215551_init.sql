-- =============================================================================
-- Darts Flinoise — schéma initial
--
-- Principe : les visiteurs (rôle `anon`) lisent les actus et le classement sans
-- se connecter. Seuls les comptes listés dans `public.admins` peuvent écrire.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Administrateurs
-- -----------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admins is 'Comptes autorisés à publier des actus et importer le classement.';

-- RLS activée sans aucune policy : la table n'est accessible qu'au travers de is_admin().
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

comment on function public.is_admin() is 'Vrai si l''utilisateur connecté est administrateur du club.';

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Utilitaire : horodatage de mise à jour
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. Actus
-- -----------------------------------------------------------------------------
create type public.post_category as enum ('info', 'tournoi', 'resultats', 'annonce');

create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(btrim(title)) between 1 and 120),
  body       text not null check (char_length(btrim(body)) between 1 and 2000),
  category   public.post_category not null default 'info',
  pinned     boolean not null default false,
  author_id  uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is 'Actus et infos pratiques publiées par les administrateurs.';

create index posts_feed_idx on public.posts (pinned desc, created_at desc);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy "Lecture publique des actus"
  on public.posts for select
  to anon, authenticated
  using (true);

create policy "Création des actus par les admins"
  on public.posts for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Modification des actus par les admins"
  on public.posts for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Suppression des actus par les admins"
  on public.posts for delete
  to authenticated
  using ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- 4. Classement
-- -----------------------------------------------------------------------------
create table public.ranking_entries (
  id             bigint generated always as identity primary key,
  position       integer not null check (position > 0),
  player_name    text not null check (char_length(btrim(player_name)) between 1 and 80),
  points         numeric(10, 2) not null,
  matches_played integer check (matches_played >= 0),
  wins           integer check (wins >= 0)
);

comment on table public.ranking_entries is 'Classement courant, remplacé en bloc à chaque import Excel.';

create index ranking_entries_position_idx on public.ranking_entries (position);

create table public.ranking_imports (
  id          bigint generated always as identity primary key,
  file_name   text not null check (char_length(file_name) <= 255),
  row_count   integer not null check (row_count >= 0),
  imported_by uuid default auth.uid() references auth.users (id) on delete set null,
  imported_at timestamptz not null default now()
);

comment on table public.ranking_imports is 'Historique des imports du classement (date affichée sur le site).';

create index ranking_imports_imported_at_idx on public.ranking_imports (imported_at desc);

alter table public.ranking_entries enable row level security;
alter table public.ranking_imports enable row level security;

create policy "Lecture publique du classement"
  on public.ranking_entries for select
  to anon, authenticated
  using (true);

create policy "Lecture publique des imports"
  on public.ranking_imports for select
  to anon, authenticated
  using (true);

-- Aucune policy d'écriture : le classement ne change que via replace_ranking().

-- Remplace tout le classement en une seule transaction (tout ou rien).
-- p_rows : [{ "position": 1, "player_name": "…", "points": 42, "matches_played": 10, "wins": 7 }, …]
create or replace function public.replace_ranking(p_file_name text, p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Action réservée aux administrateurs' using errcode = '42501';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Le classement doit être une liste de joueurs' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_rows);
  if v_count = 0 or v_count > 500 then
    raise exception 'Le classement doit contenir entre 1 et 500 joueurs' using errcode = '22023';
  end if;

  delete from public.ranking_entries where true;

  insert into public.ranking_entries (position, player_name, points, matches_played, wins)
  select r.position, btrim(r.player_name), r.points, r.matches_played, r.wins
  from jsonb_to_recordset(p_rows) as r (
    position       integer,
    player_name    text,
    points         numeric,
    matches_played integer,
    wins           integer
  );

  insert into public.ranking_imports (file_name, row_count)
  values (left(coalesce(nullif(btrim(p_file_name), ''), 'import'), 255), v_count);

  return v_count;
end;
$$;

comment on function public.replace_ranking(text, jsonb) is 'Remplace le classement complet (réservé aux administrateurs).';

revoke execute on function public.replace_ranking(text, jsonb) from public, anon;
grant execute on function public.replace_ranking(text, jsonb) to authenticated;
