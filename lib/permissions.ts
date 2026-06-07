import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

export type Role = "reader" | "editor" | "admin";

export const ROLE_RANK: Record<Role, number> = {
  reader: 0,
  editor: 1,
  admin: 2,
};

export function hasRole(role: string | undefined | null, min: Role): boolean {
  if (!role) return false;
  const rank = ROLE_RANK[role as Role];
  if (rank === undefined) return false;
  return rank >= ROLE_RANK[min];
}

/** Editors and admins may create/edit/delete wiki content. */
export function canEdit(role: string | undefined | null): boolean {
  return hasRole(role, "editor");
}

/** Only admins may manage users/roles. */
export function canAdmin(role: string | undefined | null): boolean {
  return hasRole(role, "admin");
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  username?: string | null;
  bio?: string | null;
};

/**
 * Reads the current session on the server. Cached per-request so multiple
 * calls in one render don't re-hit the auth handler.
 */
export const getCurrentSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
});

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getCurrentSession();
  if (!session?.user) return null;
  const u = session.user as typeof session.user & {
    role?: string;
    username?: string | null;
    bio?: string | null;
  };
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: (u.role as Role) ?? "reader",
    username: u.username,
    bio: u.bio,
  };
}

/** Throws if not authenticated. Returns the session user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/** Throws unless the user can edit wiki content. */
export async function requireEditor(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canEdit(user.role)) throw new Error("FORBIDDEN");
  return user;
}

/** Throws unless the user is an admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAdmin(user.role)) throw new Error("FORBIDDEN");
  return user;
}
