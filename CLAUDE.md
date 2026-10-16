@AGENTS.md

# CLAUDE.md — contents-lab (front Ignite, service Cloud Run `qi-front-app`)

Front Next.js 16 (App Router, React 19, Tailwind 4) du catalogue de cours Ignite.
L'authentification passe par le SSO Qavaa (voir le `CLAUDE.md` de `qavaa-innovate-sso`, §6) ;
les cours, paniers, commandes et la progression viennent de `courses-api`.

## Configuration

| Fichier | Rôle |
|---|---|
| `lib/sso.ts` | URLs du SSO (`SSO_API_URL`, `SSO_FRONT_URL`), client OAuth2, cookies de session |
| `lib/coursesApi.ts` | `COURSES_API_URL` (`COURSES_API_URL` ou `NEXT_PUBLIC_CART_API_URL`, défaut Cloud Run `contents-lab-api`) |
| `proxy.ts` | routes protégées (`/dashboard`, `/course/`, …), vérification de session SSO toutes les 60 s |
| `lib/roles.ts` | droits de l'utilisateur (admin, instructeur) |
| `lib/curriculum.ts`, `lib/format.ts` | calculs sur les modules/leçons publiés, formats de durée et de date |

Les appels aux API se font **côté serveur** (server actions dans `actions/`) avec le cookie
httpOnly `access_token` envoyé en `Authorization: Bearer`. Ne jamais exposer ce token au navigateur.

## Prise en main rapide

```bash
npm install && npm run dev            # http://localhost:3000, branché sur les API de production par défaut
# Contre une pile locale (SSO sur :8000, courses-api sur :8080) :
NEXT_PUBLIC_SSO_API_URL=http://localhost:8000 COURSES_API_URL=http://localhost:8080 npm run dev
npm run build                         # vérifie les types (à lancer avant chaque push)
```

| Page | Qui | Fichiers principaux |
|---|---|---|
| `/` visiteur | tout le monde | `components/home/Home.tsx`, `components/banner/Banner.tsx` |
| `/` connecté | utilisateur connecté | `app/(main)/page.tsx` → `components/learning/LearningHome.tsx` |
| `/career-tracks` | tout le monde | `app/(main)/career-tracks/page.tsx`, `components/career-tracks/` |
| `/career-tracks/<slug>` | tout le monde | `app/(main)/career-tracks/[slug]/page.tsx` (learning path) |
| `/dashboard…` | connecté | `app/dashboard/`, `components/dashboard/` |
| `/dashboard/manage-courses…` | instructeur, admin | `app/dashboard/manage-courses/`, `components/dashboard/manage/`, `actions/manageCourses.ts` |

Règles à retenir :
- **Toutes les données viennent des API** (SSO et courses-api) via les server actions de `actions/`.
  Aucune donnée de cours n'est écrite en dur.
- **Droits** : `lib/roles.ts` (`isAdmin`, `isInstructor`, `canManageCourses`). Admin = rôle
  `admin`/`superadmin`/`superuser` **ou** `is_staff`/`is_superuser` du SSO. Le front ne fait que masquer :
  courses-api revérifie tout.
- Un nouvel appel d'API authentifié lit le cookie httpOnly `access_token` côté serveur
  (voir `apiCall` dans `actions/manageCourses.ts` ou `getJson` dans `actions/dashboard.ts`).
- Textes de l'interface en anglais, commentaires en français.

## Header du site (`components/header/`)

- `navigation.ts` : onglets (*Home*, *Browse Courses*, *Explore Careers*) et liens du menu utilisateur.
- `laptop/Header.tsx` : logo Ignite à gauche, onglets dans une pilule au centre ; à droite,
  *Log In* / *Sign Up* pour un visiteur, **panier + `UserMenu`** pour un utilisateur connecté.
- `laptop/UserMenu.tsx` : avatar (photo du profil SSO sinon initiales) avec **point vert « connecté »**,
  prénom, menu *Dashboard*, *My courses*, *Manage courses* (si autorisé), *Settings*, *Sign out*
  (`signOut()` = déconnexion globale SSO).
- `mobile/MobileHeaderBar.tsx` : même logique dans un menu plein écran.
- La session côté client vient de `lib/useSessionUser.ts` → `GET /api/auth/me`
  (`{authenticated, user: {name, email, avatarUrl, canManageCourses}}`, jamais le token).
- `components/CartButton.tsx` : nombre d'articles du panier (courses-api), rafraîchi sur l'événement
  `cartUpdate`.

## Accueil

- **Visiteur** : `Banner.tsx` (titre, CTA *Start Learning* / *Explore Career Tracks*, photo et badges).
  Nombre de cours, d'apprenants (`total_students`) et de catégories : `getPublishedCourses()`.
- **Connecté** : `LearningHome.tsx` (maquette « Trenning » adaptée) :

| Bloc | Donnée |
|---|---|
| *Good morning, <prénom>* | SSO `GET /api/users/me/` |
| Courses / Lessons done / Completed | courses-api `/api/enrollments/stats/?days=30` |
| Bandeau *New* | dernier cours publié (`/api/courses/`) |
| *In progress learning content* | `/api/enrollments/` (cours non terminés, bouton Start/Continue → reprise) |
| *New courses* | cours publiés auxquels l'utilisateur n'est pas inscrit |
| Learning content / Learning time | somme des leçons des inscriptions / `learning_minutes` |
| Goals | progression moyenne + série de jours actifs (`lib/streak.ts`) |

  Le *Leaderboard* de la maquette n'est pas repris : aucune API ne classe les utilisateurs.

## Career tracks

Chaque **cours publié** sert de parcours métier (pas de modèle dédié).
- `/career-tracks` : filtres recherche, *Course type* (durée totale : < 3 h, 3-10 h, 10 h+, voir
  `TRACK_TYPES` dans `lib/curriculum.ts`), difficulté, catégories ; cartes **sans prix**, avec la
  catégorie et un bouton *Learning path*.
- `/career-tracks/<slug>` : modules publiés dans l'ordre (étapes reliées), leçons dépliables, coches
  sur les leçons terminées si l'utilisateur est inscrit ; bloc final *Continue the path* (inscrit) ou
  *Add to cart* (sinon).

## Gestion des cours (`/dashboard/manage-courses`)

L'onglet *Manage courses* du dashboard n'apparaît que si `canManageCourses(user)`. Un étudiant qui
ouvre l'URL est redirigé vers `/dashboard`.

| | Instructeur | Administrateur |
|---|---|---|
| Liste | ses cours | tous les cours (+ auteur), filtres de statut et recherche |
| Créer / modifier / supprimer | ses cours | tous |
| Statut | *Submit for review* (draft → review), *Back to draft* | *Validate & publish*, *Move to draft* |
| Programme (modules, leçons, vidéo) | ses cours | tous |

Statuts : `draft` (brouillon) → `review` (en attente de validation) → `published` (visible au catalogue).
Écrans : liste (`page.tsx`), création (`new/page.tsx`, redirige vers l'éditeur), éditeur
(`[slug]/page.tsx` = `CourseForm` + `CurriculumEditor`). Un cours déjà commandé ne peut pas être
supprimé (409) : le passer en brouillon.

## Dashboard (`/dashboard`)

Page d'arrivée après la connexion SSO (`safeInternalPath` redirige vers `/dashboard` par défaut).

```
app/dashboard/
├── layout.tsx            # Sidebar + Topbar (utilisateur SSO + avatar du profil)
├── page.tsx              # → components/dashboard/Dashboard.tsx
├── courses/page.tsx      # onglet « Courses » : ?q= (recherche) & ?status=in-progress|not-started|completed
├── manage-courses/       # onglet « Manage courses » (instructeurs, admins) : liste, new/, [slug]/
└── settings/page.tsx     # onglet « Setting » : Account / Profile / Security
components/dashboard/
├── Sidebar.tsx, MobileNav.tsx, navigation.ts   # onglets : Dashboard, Courses, [Manage courses] | Setting, Logout
├── Topbar.tsx            # recherche (GET /dashboard/courses?q=), cloche, initiales + nom
├── IgniteLogo.tsx        # logo Ignite (éclair noir + « IGNITE »)
├── UserAvatar.tsx        # photo de profil sinon initiales (lib/initials.ts)
├── HeroBanner.tsx        # bannière « Online course » → /courses
├── CourseProgressChips.tsx  # 3 derniers cours consultés : « x/y watched »
├── ContinueWatching.tsx  # carrousel de CourseCard en mode progression
├── StatisticCard.tsx, ActivityChart.tsx, Greeting.tsx  # anneau de progression, salutation, activité 7 j
├── MyCourses.tsx         # liste filtrable des cours inscrits
├── SettingsForms.tsx     # formulaires (useActionState + actions/settings.ts)
├── manage/               # StatusBadge, CourseActions, CourseForm, CurriculumEditor
└── mappers.ts            # Enrollment → props de CourseCard, lien de reprise
```

Sections volontairement absentes de la maquette d'origine : *Your mentor*, *Your lesson*, *Friends*
et l'icône de messagerie.

### Provenance des données

| Donnée | Source | Action serveur |
|---|---|---|
| Nom, email, téléphone, rôles, `auth_provider` | SSO `GET /api/users/me/` | `actions/user.ts` → `getConnectedUser` |
| Avatar, bio, date de naissance, langue | SSO `GET /api/profile/me/` | `actions/settings.ts` → `getMyProfile` |
| Cours inscrits + progression | courses-api `GET /api/enrollments/` | `actions/dashboard.ts` → `getMyEnrollments` |
| Statistiques (totaux, activité quotidienne) | courses-api `GET /api/enrollments/stats/?days=7` | `getLearningStats` |
| Modifier nom / téléphone | SSO `PATCH /api/users/<id>/` | `updateAccountAction` |
| Modifier profil + avatar | SSO `PATCH /api/profile/me/` (multipart, `avatar_file`) | `updateProfileAction` |
| Changer le mot de passe | SSO `POST /api/users/me/change-password/` | `changePasswordAction` |
| Droits (onglet Manage courses) | SSO `GET /api/users/me/` (`roles`, `is_staff`, `is_superuser`) | `lib/roles.ts` |
| Cours gérables | courses-api `GET /api/courses/manage/?status=&search=` | `actions/manageCourses.ts` → `getManagedCourses` |
| Créer / modifier / supprimer un cours | `POST`/`PATCH`/`DELETE /api/courses/<slug>/` | `saveCourseAction`, `deleteCourseAction` |
| Statut (soumettre, publier, brouillon) | `POST /api/courses/<slug>/status/` | `setCourseStatusAction` |
| Modules, leçons, vidéos | `/api/modules/`, `/api/lessons/`, `/api/videos/` | `saveModuleAction`, `saveLessonAction`, … |

Seuls les cours **auxquels l'utilisateur est inscrit** apparaissent (inscriptions filtrées par le
`sub` du token dans courses-api). Si une API est injoignable, les sections s'affichent vides avec
un message, sans casser la page.

### Barre de progression de lecture

- `components/courses/CourseCard.tsx` est le composant de la page d'accueil. Avec la prop
  `progress` (`percentage`, `completedLessons`, `totalLessons`, `href`, `category`), il affiche la
  catégorie, une barre de progression et un bouton *Start course / Continue / Watch again* à la
  place du prix et du bouton panier. Sans `progress`, il est inchangé.
- La progression est **enregistrée par le lecteur** `components/courses/CoursePlayerClient.tsx`
  (page `/course/<slug>/learn`, qui reçoit l'inscription via `getEnrollment(slug)`) :
  - ouverture d'une leçon → elle devient la « dernière leçon » (reprise depuis le dashboard) ;
  - lecture YouTube → position sauvegardée toutes les 15 s et à chaque pause ;
  - fin de la vidéo ou bouton *Mark as complete* → leçon terminée, pourcentage recalculé par l'API ;
  - à la réouverture, le lecteur reprend sur la dernière leçon à la position enregistrée
    (le lien *Continue* pointe vers `/course/<slug>/learn#<leçon>`).
- Le pourcentage = leçons publiées terminées / leçons publiées du cours (calculé par courses-api).

### Couleurs

Accent du dashboard : `#6d5deb` (fond clair `#ece9fd`, texte `#4f3fd6`), fond de page `#f5f5fa`.

## Commandes

```bash
npm run dev       # http://localhost:3000
npm run build     # vérifie les types et génère le build standalone (Dockerfile)
npx eslint <fichiers>
```

`next.config.ts` : `serverActions.bodySizeLimit = 5mb` pour l'upload de l'avatar.
