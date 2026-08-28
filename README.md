# Contents Lab

Contents Lab is the course and content app of the Qavaa learning platform.
The user finds the public course catalog here.
The user can create a cart and check course details.
Staff users manage content in the protected admin area.

## Role in the platform

Five repos form the learning platform.

| Repo | Role | Dev port |
| ---- | ---- | ---- |
| qi-sso-front | Identity portal | 3001 |
| contents-lab | Course catalog, cart, staff admin (this repo) | 3000 |
| Digital-Readiness-Lab | User accounts, labs, code execution API | 8000 |
| courses-api | Course catalog REST API | 8001 |
| pratice-lab | Coding practice workspace | 3002 |

This repo is the public face of the platform.
It holds the marketing pages, the course catalog, and the staff admin area.

## Where the data comes from

The app reads course and cart data from the `courses-api` Django service.
The course list, course detail, and cart actions in `actions/` call the API.
The course catalog API runs on port 8001 in development.

The labs and skills in the admin area come from the DRL backend on port 8000.

## Authentication

The identity portal protects the admin area.
The middleware in `proxy.ts` protects the `/admin` routes.
A user without an `access_token` cookie goes to the portal on port 3001.
The portal returns the user to the same admin page after sign-in.

The header login and signup buttons use PKCE.
They redirect the user to the `qi-sso-front` portal.
The portal sends the user back with an authorization code.
The callback route at `/auth/callback` exchanges the code for tokens.
The token exchange posts to the Django OAuth token endpoint on port 8000.

The admin section needs a staff account.
A student account lands on the not-authorized page.

## Requirements

- Node.js 20 or newer.
- npm.
- The `qi-sso-front` portal on port 3001.
- The `courses-api` service on port 8001.
- The DRL backend on port 8000 (for admin data).

## Setup

Install the dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

The server runs on port 3000.
Open `http://localhost:3000` in the browser.

## Environment variables

The app reads these values from the environment.

| Variable | Purpose | Default |
| ------- | ------ | ------- |
| `SSO_PORTAL_URL` | The identity portal address (proxy middleware) | `http://localhost:3001` |
| `NEXT_PUBLIC_SSO_URL` | The identity portal address (header buttons) | `http://localhost:3001` |
| `NEXT_PUBLIC_SSO_API_URL` | The identity backend API address | `http://localhost:8000` |

## Scripts

| Script | Command | Description |
| ------ | ------- | ----------- |
| Development | `npm run dev` | Start the development server on port 3000 |
| Build | `npm run build` | Create a production build |
| Start | `npm start` | Start the production server |
| Lint | `npm run lint` | Run the ESLint checks |

## Project structure

| Path | Purpose |
| ---- | ------- |
| `app/(marketing)/` | The public pages and course catalog |
| `app/courses/` | The course detail pages |
| `app/carts/` | The cart pages |
| `app/admin/` | The staff admin area (categories, courses, labs, quizzes, skills, learning paths) |
| `app/auth/callback/` | The SSO token exchange callback |
| `app/not-authorized/` | The access-denied page |
| `actions/` | The API calls (cart, course detail, courses) |
| `components/header/` | The header with the login and signup buttons |
| `proxy.ts` | The route protection middleware |

## Related repos

- [qi-sso-front](https://github.com/teamqavaa/qi-sso-front.git)
- [courses-api](https://github.com/teamqavaa/courses-api.git)
- [Digital-Readiness-Lab](https://github.com/teamqavaa/Digital-Readiness-Lab.git)
- [pratice-lab](https://github.com/teamqavaa/pratice-lab.git)