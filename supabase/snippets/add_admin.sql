-- Donne les droits d'administration à un compte existant.
-- 1. Créez d'abord le compte dans Supabase : Authentication > Users > Add user.
-- 2. Remplacez l'adresse ci-dessous puis exécutez ce script dans le SQL Editor.

insert into public.admins (user_id)
select id
from auth.users
where email = 'admin@exemple.fr'
on conflict (user_id) do nothing;
