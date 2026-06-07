"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/permissions";
import type { ActionResult, RecentChange } from "@/lib/types";

function permissionError(err: unknown): string {
  if (
    err instanceof Error &&
    (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")
  ) {
    return "You don't have permission to do this.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export async function isWatching(pageSlug: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const page = await prisma.wikiPage.findUnique({
    where: { slug: pageSlug },
    select: { id: true },
  });
  if (!page) return false;

  const watch = await prisma.watch.findUnique({
    where: { userId_pageId: { userId: user.id, pageId: page.id } },
    select: { userId: true },
  });
  return watch !== null;
}

export async function watchPage(
  pageSlug: string,
): Promise<ActionResult<{ watching: true }>> {
  try {
    const user = await requireUser();

    const page = await prisma.wikiPage.findUnique({
      where: { slug: pageSlug },
      select: { id: true, slug: true },
    });
    if (!page) return { ok: false, error: "Page not found." };

    const { id: pageId, slug } = page;
    const userId = user.id;

    await prisma.watch.upsert({
      where: { userId_pageId: { userId, pageId } },
      create: { userId, pageId },
      update: {},
    });

    revalidatePath(`/wiki/${slug}`);
    revalidatePath("/wiki/watchlist");

    return { ok: true, data: { watching: true } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function unwatchPage(
  pageSlug: string,
): Promise<ActionResult<{ watching: false }>> {
  try {
    const user = await requireUser();

    const page = await prisma.wikiPage.findUnique({
      where: { slug: pageSlug },
      select: { id: true, slug: true },
    });

    if (page) {
      await prisma.watch.deleteMany({
        where: { userId: user.id, pageId: page.id },
      });
      revalidatePath(`/wiki/${page.slug}`);
    }

    revalidatePath("/wiki/watchlist");

    return { ok: true, data: { watching: false } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function listWatchlist(limit = 50): Promise<RecentChange[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const watchedRows = await prisma.watch.findMany({
    where: { userId: user.id },
    select: { pageId: true },
  });
  if (watchedRows.length === 0) return [];

  const watchedIds = watchedRows.map((w) => w.pageId);

  const rows = await prisma.pageRevision.findMany({
    where: { pageId: { in: watchedIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      pageId: true,
      comment: true,
      createdAt: true,
      page: { select: { slug: true, title: true } },
      editor: { select: { id: true, name: true, username: true } },
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
    editor: row.editor,
    isNewPage: row.createdAt.getTime() === firstAt.get(row.pageId),
  }));
}
