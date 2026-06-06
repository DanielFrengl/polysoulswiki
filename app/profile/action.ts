"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

function permissionError(err: unknown): string {
  if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
    return "You don't have permission to do this.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export async function updateProfile(input: {
  name: string;
  username?: string;
  bio?: string;
}): Promise<ActionResult> {
  try {
    const user = await requireUser();

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Name is required." };

    const username = input.username?.trim();
    const bio = input.bio?.trim();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        username: username ? username : null,
        bio: bio ? bio : null,
      },
    });

    revalidatePath("/profile");

    return { ok: true, data: undefined };
  } catch (err) {
    // Unique-constraint violation on username -> friendly message.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, error: "That username is already taken." };
    }
    return { ok: false, error: permissionError(err) };
  }
}
