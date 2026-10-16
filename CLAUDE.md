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

Les appels aux API se font **côté serveur** (server actions dans `actions/`) avec le cookie
httpOnly `access_token` envoyé en `Authorization: Bearer`. Ne jamais exposer ce token au navigateur.

## Dashboard (`/dashboard`)

Page d'arrivée après la connexion SSO (`safeInternalPath` redirige vers `/dashboard` par défaut).

```
app/dashboard/
├── layout.tsx            # Sidebar + Topbar (utilisateur SSO + avatar du profil)
├── page.tsx              # → components/dashboard/Dashboard.tsx
├── courses/page.tsx      # onglet « Courses » : ?q= (recherche) & ?status=in-progress|not-started|completed
└── settings/page.tsx     # onglet « Setting » : Account / Profile / Security
components/dashboard/
├── Sidebar.tsx, MobileNav.tsx, navigation.ts   # onglets : Dashboard, Courses | Setting, Logout
├── Topbar.tsx            # recherche (GET /dashboard/courses?q=), cloche, initiales + nom
├── IgniteLogo.tsx        # logo Ignite (éclair noir + « IGNITE »)
├── UserAvatar.tsx        # photo de profil sinon initiales (lib/initials.ts)
├── HeroBanner.tsx        # bannière « Online course » → /courses
├── CourseProgressChips.tsx  # 3 derniers cours consultés : « x/y watched »
├── ContinueWatching.tsx  # carrousel de CourseCard en mode progression
├── StatisticCard.tsx, ActivityChart.tsx, Greeting.tsx  # anneau de progression, salutation, activité 7 j
├── MyCourses.tsx         # liste filtrable des cours inscrits
├── SettingsForms.tsx     # formulaires (useActionState + actions/settings.ts)
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
