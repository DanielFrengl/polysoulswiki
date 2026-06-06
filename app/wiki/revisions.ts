"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/permissions";
import type { ActionResult, RevisionFull, RevisionSummary } from "@/lib/types";

function permissionError(err: unknown): string {
  if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
    return "You don't have permission to do this.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

const editorSelect = {
  select: { id: true, name: true, username: true },
} as const;

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
          comment: `Reverted to revision ${revisionId}`,
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
