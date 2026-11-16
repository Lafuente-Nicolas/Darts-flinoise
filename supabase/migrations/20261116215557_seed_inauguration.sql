-- Première actu du club : l'inauguration, épinglée en haut de la page Actus.
-- Idempotent : ne crée pas de doublon si la migration est rejouée.

insert into public.posts (title, body, category, pinned)
select
  'Inauguration du club le 1er décembre',
  'Le club ouvre officiellement ses portes le mardi 1er décembre, de 18h à 21h, à la Friterie Diligense.' || E'\n\n' ||
  'Venez passer un moment convivial avec nous : découvrir les fléchettes, lancer vos premières volées et rencontrer les membres du club. Débutants comme joueurs confirmés, tout le monde est le bienvenu !',
  'annonce',
  true
where not exists (
  select 1 from public.posts where title = 'Inauguration du club le 1er décembre'
);
