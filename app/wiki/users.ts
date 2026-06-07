"use server";

import { prisma } from "@/lib/prisma";
import type { PublicUser, UserContribution } from "@/lib/types";
import type { Role } from "@/lib/permissions";

export async function getPublicUser(username: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) return null;

  const contributionCount = await prisma.pageRevision.count({
    where: { editorId: user.id },
  });

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio ?? null,
    role: user.role as Role,
    createdAt: user.createdAt,
    contributionCount,
  };
}

export async function listUserContributions(
  userId: string,
  limit = 50,
): Promise<UserContribution[]> {
  const rows = await prisma.pageRevision.findMany({
    where: { editorId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      pageId: true,
      comment: true,
      createdAt: true,
      page: { select: { slug: true, title: true } },
    },
  });

  if (rows.length === 0) return [];

  const pageIds = [...new Set(rows.map((r) => r.pageId))];
  const firsts = await prisma.pageRevision.groupBy({
    by: ["pageId"],
    where: { pageId: { in: pageIds } },
    _min: { createdAt: true },
  });
  const firstAt = new Map(firsts.map((f) => [f.pageId, f._min.createdAt?.getTime()]));

  return rows.map((row) => ({
    id: row.id,
    pageSlug: row.page.slug,
    pageTitle: row.page.title,
    comment: row.comment,
    createdAt: row.createdAt,
    isNewPage: row.createdAt.getTime() === firstAt.get(row.pageId),
  }));
}
