// Shared domain types for the PolySouls wiki.
// These are the stable contract between server actions and UI components.

import type { Role } from "@/lib/permissions";

export type { Role };

export interface WikiPageSummary {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  updatedAt: Date;
}

export interface WikiPageFull {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  infobox: InfoboxField[] | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; username: string | null } | null;
  categories: CategorySummary[];
}

/** One row in a page's infobox (the structured stat sidebar). */
export interface InfoboxField {
  label: string;
  value: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CategoryWithCount extends CategorySummary {
  pageCount: number;
}

export interface RevisionSummary {
  id: string;
  title: string;
  comment: string | null;
  createdAt: Date;
  editor: { id: string; name: string; username: string | null } | null;
}

export interface RevisionFull extends RevisionSummary {
  content: string;
  pageId: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: Role;
  createdAt: Date;
}

// Phase 2 ------------------------------------------------------------------

/** One entry in the site-wide recent-changes feed (a page revision). */
export interface RecentChange {
  id: string; // revision id
  pageSlug: string;
  pageTitle: string;
  comment: string | null;
  createdAt: Date;
  editor: { id: string; name: string; username: string | null } | null;
  isNewPage: boolean; // true if this is the page's first revision
}

/** A single contribution (revision) made by one user, for their profile. */
export interface UserContribution {
  id: string; // revision id
  pageSlug: string;
  pageTitle: string;
  comment: string | null;
  createdAt: Date;
  isNewPage: boolean;
}

/** Public, read-only view of a user (the /wiki/user/[username] page). */
export interface PublicUser {
  id: string;
  name: string;
  username: string | null;
  bio: string | null;
  role: Role;
  createdAt: Date;
  contributionCount: number;
}

/** A redirect (alias slug → page) row for the admin panel. */
export interface RedirectRow {
  id: string;
  fromSlug: string;
  toPage: { slug: string; title: string };
  createdAt: Date;
}

export interface RedirectInput {
  fromSlug: string;
  toPageSlug: string;
}

// Phase 3 ------------------------------------------------------------------

/** A talk/discussion message; top-level messages carry their replies. */
export interface TalkMessageNode {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string; username: string | null } | null;
  /** True if the current viewer may delete this message (author or editor+). */
  canDelete: boolean;
  replies: TalkMessageNode[];
}

export interface TalkMessageInput {
  pageSlug: string;
  body: string;
  parentId?: string | null; // set to reply to an existing message
}

// Input payloads ------------------------------------------------------------

export interface PageInput {
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  infobox?: InfoboxField[] | null;
  categorySlugs?: string[];
  comment?: string | null; // edit summary for the revision
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  pageSlugs?: string[];
}

// Result envelope used by mutating server actions so the UI can show errors
// without try/catch on the client.
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
