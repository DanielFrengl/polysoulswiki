# PolySouls Wiki — build contract

Shared API between backend (server actions) and frontend (UI). Both sides
import types from `lib/types.ts`. **Do not change these signatures** without
updating this file.

## Stack

- Next.js 16 (App Router, RSC, Turbopack), React 19, TypeScript strict.
- Prisma + Postgres (Neon). Client: `import { prisma } from "@/lib/prisma"`.
- Auth: BetterAuth. Server session via `lib/permissions.ts`
  (`getCurrentUser`, `requireUser`, `requireEditor`, `requireAdmin`).
  Client: `lib/auth-client.ts` (`signIn`, `signUp`, `signOut`, `useSession`).
  Route auth-gate lives in `proxy.ts` (Next 16 middleware convention).
- UI: shadcn/ui (new-york, neutral), Tailwind v4. Components in `components/ui`.
- Editor: Tiptap (`@tiptap/react`). Sanitize HTML with `isomorphic-dompurify` before render.
- Roles: `reader` < `editor` < `admin`. Editors+ can edit content; admins manage users.

## Server actions

### `app/wiki/action.ts` ("use server")

Reads (public):
- `getPage(slug: string): Promise<WikiPageFull | null>`
- `listPages(): Promise<WikiPageSummary[]>`            // newest updated first
- `searchPages(q: string): Promise<WikiPageSummary[]>` // title + content, case-insensitive
- `listCategories(): Promise<CategoryWithCount[]>`
- `getCategoryBySlug(slug: string): Promise<CategorySummary | null>`
- `getPagesInCategory(categorySlug: string): Promise<WikiPageSummary[]>`
- `getRedirect(slug: string): Promise<{ toSlug: string } | null>`
- `listRedirects(): Promise<RedirectRow[]>`

Writes (require editor; return `ActionResult`):
- `createPage(input: PageInput): Promise<ActionResult<{ slug: string }>>`
- `updatePage(slug: string, input: PageInput): Promise<ActionResult<{ slug: string }>>`
- `deletePage(slug: string): Promise<ActionResult>`
- `createCategory(input: CategoryInput): Promise<ActionResult<{ slug: string }>>`
- `updateCategory(id: string, input: CategoryInput): Promise<ActionResult<{ slug: string }>>`
- `deleteCategory(id: string): Promise<ActionResult>`
- `createRedirect(input: RedirectInput): Promise<ActionResult<{ id: string }>>`
- `deleteRedirect(id: string): Promise<ActionResult>`

Renaming a page (slug change in `updatePage`) auto-creates a redirect from the
old slug; creating a page deletes any redirect that shadows its slug.

Every successful create/update of a page MUST also insert a `PageRevision`
snapshot (title + content + comment + editorId). Calls `revalidatePath` for the
affected routes.

### Revisions — `app/wiki/revisions.ts` ("use server")

- `listRevisions(slug: string): Promise<RevisionSummary[]>`        // newest first
- `getRevision(id: string): Promise<RevisionFull | null>`
- `revertToRevision(revisionId: string): Promise<ActionResult<{ slug: string }>>` // editor; creates a new revision
- `listRecentChanges(limit?: number): Promise<RecentChange[]>`     // site-wide feed, newest first

### Users — `app/wiki/users.ts` ("use server")

- `getPublicUser(username: string): Promise<PublicUser | null>`
- `listUserContributions(userId: string, limit?: number): Promise<UserContribution[]>` // newest first

### Admin — `app/wiki/admin/action.ts` ("use server")

- `listUsers(): Promise<AdminUserRow[]>`                          // admin only
- `setUserRole(userId: string, role: Role): Promise<ActionResult>` // admin only

### Profile — `app/profile/action.ts` ("use server")

- `updateProfile(input: { name: string; username?: string; bio?: string }): Promise<ActionResult>` // require user

### Image upload — `app/api/upload/route.ts` (POST, editor only)

Multipart `file` field → `{ url }`. Uses Vercel Blob when `BLOB_READ_WRITE_TOKEN`
is set, else writes to `public/uploads/` (dev). Validates image/* and ≤ 5 MB.

## Routes (App Router)

- `/` → redirect `/wiki/home`
- `/wiki/[slug]` — public page view (TOC, breadcrumbs, categories, metadata, edit/history buttons for editors); unknown slug resolves a redirect (→ `?from=<slug>`) before 404
- `/wiki/new` — create page (editor)
- `/wiki/edit/[slug]` — edit page (editor)
- `/wiki/[slug]/history` — revision list + diff + revert (view public, revert editor)
- `/wiki/dashboard` — all pages + search
- `/wiki/category/[slug]` — pages in a category
- `/wiki/changes` — site-wide recent changes feed (public)
- `/wiki/user/[username]` — public profile + contributions (public)
- `/wiki/admin` — manage pages, categories, redirects, users (admin; editors see content tabs only)
- `/login`, `/register` — BetterAuth email/password
- `/profile` — edit own profile

## Conventions

- Server Components by default; `"use client"` only where interactivity is needed.
- Mutations are server actions returning `ActionResult`; client shows `sonner` toasts.
- Slugs are kebab-case; validate/normalize on the server.
- Follow Vercel react/next best-practices (no unnecessary client components,
  colocate data fetching, use `revalidatePath`).
