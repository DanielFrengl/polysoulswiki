"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ROLE_RANK } from "@/lib/permissions";
import type { ActionResult, AdminUserRow, Role } from "@/lib/types";

function permissionError(err: unknown): string {
  if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
    return "You don't have permission to do this.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export async function listUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: (u.role as Role) ?? "reader",
    createdAt: u.createdAt,
  }));
}

export async function setUserRole(userId: string, role: Role): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!(role in ROLE_RANK)) {
      return { ok: false, error: "Invalid role." };
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "User not found." };

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/wiki/admin");

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}
