"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, getCurrentUser, canEdit } from "@/lib/permissions";
import type {
  ActionResult,
  TalkMessageInput,
  TalkMessageNode,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function permissionError(err: unknown): string {
  if (
    err instanceof Error &&
    (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")
  ) {
    return "You don't have permission to do this.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

const authorSelect = {
  select: { id: true, name: true, username: true },
} as const;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listTalkMessages(
  pageSlug: string,
): Promise<TalkMessageNode[]> {
  const page = await prisma.wikiPage.findUnique({
    where: { slug: pageSlug },
    select: { id: true },
  });
  if (!page) return [];

  const user = await getCurrentUser();

  const rows = await prisma.talkMessage.findMany({
    where: { pageId: page.id, parentId: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      authorId: true,
      author: authorSelect,
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          authorId: true,
          author: authorSelect,
        },
      },
    },
  });

  const toNode = (
    msg: {
      id: string;
      body: string;
      createdAt: Date;
      authorId: string | null;
      author: { id: string; name: string; username: string | null } | null;
    },
    replies: TalkMessageNode[] = [],
  ): TalkMessageNode => ({
    id: msg.id,
    body: msg.body,
    createdAt: msg.createdAt,
    author: msg.author ?? null,
    canDelete:
      !!user &&
      (user.id === msg.authorId || canEdit(user.role)),
    replies,
  });

  return rows.map((row) =>
    toNode(
      row,
      row.replies.map((r) => toNode(r)),
    ),
  );
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function postTalkMessage(
  input: TalkMessageInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();

    const body = input.body.trim();
    if (!body) return { ok: false, error: "Message body cannot be empty." };
    if (body.length > 5000)
      return { ok: false, error: "Message is too long (max 5000 characters)." };

    const page = await prisma.wikiPage.findUnique({
      where: { slug: input.pageSlug },
      select: { id: true, slug: true },
    });
    if (!page) return { ok: false, error: "Page not found." };

    if (input.parentId) {
      const parent = await prisma.talkMessage.findUnique({
        where: { id: input.parentId },
        select: { id: true, pageId: true, parentId: true },
      });
      if (!parent) return { ok: false, error: "Parent message not found." };
      if (parent.pageId !== page.id)
        return { ok: false, error: "Parent message belongs to a different page." };
      if (parent.parentId !== null)
        return {
          ok: false,
          error: "You can only reply to a top-level message.",
        };
    }

    const message = await prisma.talkMessage.create({
      data: {
        pageId: page.id,
        authorId: user.id,
        body,
        parentId: input.parentId ?? null,
      },
      select: { id: true },
    });

    revalidatePath(`/wiki/${page.slug}/talk`);
    return { ok: true, data: { id: message.id } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function deleteTalkMessage(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();

    const message = await prisma.talkMessage.findUnique({
      where: { id },
      select: {
        authorId: true,
        page: { select: { slug: true } },
      },
    });
    if (!message) return { ok: false, error: "Message not found." };

    if (user.id !== message.authorId && !canEdit(user.role)) {
      throw new Error("FORBIDDEN");
    }

    await prisma.talkMessage.delete({ where: { id } });

    revalidatePath(`/wiki/${message.page.slug}/talk`);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}
