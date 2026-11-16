# Darts Flinoise

Site de l'association de fléchettes **Darts Flinoise** : séances le mardi et le jeudi de 18h à 21h
à la Friterie Diligense, actus du club et classement de la saison.

Conçu d'abord pour le téléphone (barre d'onglets en bas d'écran), avec une fléchette 3D
au logo du club en page d'accueil.

## Fonctionnalités

| Page                | Contenu                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| **Accueil**         | Fléchette 3D interactive, créneaux, 2 dernières actus, podium               |
| **Actus**           | Toutes les actus, épinglées en premier                                      |
| **Classement**      | Podium et tableau complet, date de mise à jour                              |
| **Le club**         | Présentation, horaires, lieu avec itinéraire                                |
| **Admin** (discret) | Connexion, publication / modification des actus, import Excel du classement |

Les visiteurs consultent le site sans compte. Seuls les administrateurs se connectent.

## Stack

- **React 19 + TypeScript + Vite**, routage avec **React Router 7**
- **TanStack Query** pour le chargement et le cache des données
- **Supabase** : base PostgreSQL, authentification e-mail / mot de passe, règles d'accès (RLS)
- **three.js + React Three Fiber** pour la fléchette 3D (chargée à la demande)
- **read-excel-file** pour l'import du classement (chargé uniquement dans l'espace admin)
- Polices auto-hébergées via **Fontsource** (aucun appel à Google Fonts)
- **Vitest**, **ESLint**, **Prettier**, intégration continue **GitHub Actions**

## Démarrage

Prérequis : Node.js 20.19 ou plus récent.

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
npm run dev
```

Sans fichier `.env.local`, le site s'affiche quand même : seules les actus et le classement
indiquent que les données ne sont pas encore branchées.

### Scripts

| Commande                          | Rôle                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                     | Serveur de développement                                           |
| `npm run check`                   | Toutes les vérifications du CI (format, lint, types, tests, build) |
| `npm run build`                   | Vérification des types puis build production                       |
| `npm run preview`                 | Prévisualise le build                                              |
| `npm run lint`                    | ESLint                                                             |
| `npm run typecheck`               | TypeScript                                                         |
| `npm test`                        | Tests unitaires (Vitest)                                           |
| `npm run format` / `format:check` | Prettier                                                           |
| `npm run db:types`                | Régénère `src/types/database.ts` depuis Supabase                   |

## Mise en place de Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Appliquer les migrations de `supabase/migrations/` dans l’ordre (schéma, puis actu d’inauguration) :
   - soit dans **SQL Editor** (copier-coller puis exécuter),
   - soit avec la CLI : `npx supabase link --project-ref <ref>` puis `npx supabase db push`.
3. **Authentication › Sign In / Providers › Email** : désactiver « Allow new users to sign up ».
   Les comptes sont créés uniquement à la main.
4. **Authentication › Users › Add user** : créer le compte administrateur (e-mail + mot de passe).
5. Donner les droits d'administration à ce compte avec `supabase/snippets/add_admin.sql`
   (remplacer l'e-mail puis exécuter dans le SQL Editor).
6. **Project Settings › API** : copier l'URL du projet et la clé _publishable_ (ou _anon_)
   dans `.env.local`.

### Modèle de données

- `posts` : actus (titre, texte, catégorie, épinglée)
- `ranking_entries` : classement courant
- `ranking_imports` : historique des imports (date affichée sur le site)
- `admins` : comptes autorisés à écrire

Tout le monde peut lire les actus et le classement. L'écriture est réservée aux comptes présents
dans `admins`, et le classement ne peut être remplacé que par la fonction `replace_ranking`,
en une seule transaction : un import invalide ne modifie rien.

## Importer le classement

Dans **Admin › Classement**, choisir un fichier `.xlsx` (un modèle est téléchargeable depuis la page).

- Colonnes obligatoires : `Nom` (ou Joueur, Pseudo…) et `Points` (ou Pts, Total…)
- Colonnes facultatives : `Matchs` (ou MJ, Parties…) et `Victoires`
- La ligne d'en-tête peut se trouver dans les 10 premières lignes
- Les ex æquo partagent le même rang ; un aperçu est affiché avant publication

## Textes du club

Les textes du club (présentation, horaires, adresse) sont regroupés dans
[`src/content/club.ts`](src/content/club.ts).

## Structure

```
src/
├─ app/            Routeur, client de requêtes, navigation
├─ assets/         Logo (fond transparent)
├─ components/     Composants partagés et mise en page (en-tête, barre d'onglets, pied de page)
├─ content/        Textes du club
├─ features/
│  ├─ admin/       Connexion, éditeur d'actus, import Excel
│  ├─ auth/        Session et droits administrateur
│  ├─ dart/        Fléchette 3D
│  ├─ posts/       Actus : accès aux données, cartes
│  └─ ranking/     Classement : lecteur Excel (testé), podium, tableau
├─ hooks/          Hooks génériques (visibilité, animations réduites)
├─ lib/            Client Supabase, formats, messages d'erreur
├─ pages/          Une page par route
├─ styles/         Variables de design et styles de base
└─ types/          Types de la base Supabase
supabase/
├─ migrations/     Schéma SQL et règles d'accès
└─ snippets/       Scripts d'administration
```

## Performance et sobriété

- La fléchette 3D (three.js) et l'espace admin sont dans des fichiers séparés, téléchargés
  seulement quand ils sont affichés.
- Le rendu 3D s'arrête quand la fléchette sort de l'écran ou que l'onglet passe en arrière-plan.
- Avec le mode « économie de données » ou sans WebGL, le logo s'affiche à la place.
- Le réglage « réduire les animations » du système est respecté.

## Déploiement

Le fichier `vercel.json` configure Vercel (redirection des routes vers `index.html`, cache longue
durée des fichiers versionnés) :

1. Importer le dépôt GitHub dans Vercel (préréglage _Vite_ détecté automatiquement).
2. Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` dans les variables
   d'environnement du projet.
3. Chaque push sur `main` est déployé.
