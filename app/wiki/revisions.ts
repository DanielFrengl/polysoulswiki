"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import type { ActionResult, RecentChange, RevisionFull, RevisionSummary } from "@/lib/types";

function permissionError(err: unknown): string {
  if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
    return "You don't have permission to do this.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

const editorSelect = {
  select: { id: true, name: true, username: true },
} as const;

export async function listRecentChanges(limit = 50): Promise<RecentChange[]> {
  const rows = await prisma.pageRevision.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      pageId: true,
      comment: true,
      createdAt: true,
      page: { select: { slug: true, title: true } },
      editor: editorSelect,
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

export async function listRevisions(slug: string): Promise<RevisionSummary[]> {
  const page = await prisma.wikiPage.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!page) return [];

  return prisma.pageRevision.findMany({
    where: { pageId: page.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      comment: true,
      createdAt: true,
      editor: editorSelect,
    },
  });
}

export async function getRevision(id: string): Promise<RevisionFull | null> {
  return prisma.pageRevision.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      comment: true,
      createdAt: true,
      editor: editorSelect,
      content: true,
      pageId: true,
    },
  });
}

export async function revertToRevision(
  revisionId: string,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await requireEditor();

    const revision = await prisma.pageRevision.findUnique({
      where: { id: revisionId },
      select: {
        title: true,
        content: true,
        createdAt: true,
        page: { select: { id: true, slug: true } },
      },
    });
    if (!revision) return { ok: false, error: "Revision not found." };

    const { page } = revision;

    await prisma.$transaction([
      prisma.wikiPage.update({
        where: { id: page.id },
        data: { title: revision.title, content: revision.content },
      }),
      prisma.pageRevision.create({
        data: {
          pageId: page.id,
          title: revision.title,
          content: revision.content,
          comment: `Reverted to the revision from ${formatDate(revision.createdAt)}`,
          editorId: user.id,
        },
      }),
    ]);

    revalidatePath(`/wiki/${page.slug}`);
    revalidatePath(`/wiki/${page.slug}/history`);
    revalidatePath("/wiki/dashboard");

    return { ok: true, data: { slug: page.slug } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}
