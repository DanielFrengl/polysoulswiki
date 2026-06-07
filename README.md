# PolySouls Wiki

The official community wiki for the game [PolySouls](https://store.steampowered.com/app/3604950/PolySouls/).

A Wikipedia/game-wiki style documentation site: pages with a rich-text editor,
categories, full-text search, revision history with diff & revert, role-based
editing, and an admin panel.

## Tech stack

- **Next.js 15** (App Router, RSC) · **React 19** · **TypeScript** (strict)
- **Prisma** + **PostgreSQL** (Neon in production)
- **BetterAuth** — email/password auth, sessions, roles
- **shadcn/ui** (new-york) + **Tailwind CSS v4**
- **Tiptap** — rich-text page editor

## Roles

`reader` < `editor` < `admin`

- **reader** — read everything (default for new accounts).
- **editor** — create / edit / delete pages and categories, revert revisions.
- **admin** — everything an editor can, plus manage users and their roles.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` / `DIRECT_URL` — your Neon Postgres connection strings
     (or a local Postgres, see below).
   - `BETTER_AUTH_SECRET` — `npx @better-auth/cli@latest secret`
   - `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

3. Apply the database schema and seed starter content:

   ```bash
   npx prisma migrate deploy   # or: npm run db:migrate (dev)
   npm run db:seed
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Register an account at `/register`, then promote it:

   ```bash
   npx tsx scripts/make-admin.ts you@example.com admin
   ```

### Local Postgres (optional alternative to Neon)

```bash
docker compose up -d   # starts Postgres on host port 5433
# then set in .env:
# DATABASE_URL="postgresql://polysouls:polysouls@localhost:5433/polysouls?schema=public"
# DIRECT_URL="postgresql://polysouls:polysouls@localhost:5433/polysouls?schema=public"
```

## Scripts

- `npm run dev` / `build` / `start` / `lint`
- `npm run db:migrate` — create & apply a dev migration
- `npm run db:push` — push schema without a migration
- `npm run db:studio` — open Prisma Studio
- `npm run db:seed` — seed starter categories + home page
- `npx tsx scripts/make-admin.ts <email> [admin|editor|reader]` — set a user's role

## Project layout

- `app/wiki/*` — wiki routes (page view, new, edit, history, dashboard, category, admin)
- `app/wiki/action.ts`, `revisions.ts`, `admin/action.ts`, `app/profile/action.ts` — server actions
- `lib/prisma.ts`, `lib/auth.ts`, `lib/permissions.ts`, `lib/types.ts` — core libs
- `components/wiki/*` — editor, content renderer, TOC, revision UI
- `components/nav/*` — navigation + search
- `prisma/schema.prisma` — data model · `prisma/migrations/*` — SQL migrations
- `CONTRACT.md` — the API contract between server actions and UI
