"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/permissions";
import { slugify, isValidSlug } from "@/lib/slug";
import type {
  ActionResult,
  CategoryInput,
  CategorySummary,
  CategoryWithCount,
  PageInput,
  RedirectInput,
  RedirectRow,
  WikiPageFull,
  WikiPageSummary,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a thrown permission error into a friendly ActionResult error. */
function permissionError(err: unknown): string {
  if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
    return "You don't have permission to do this.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

const authorSelect = {
  select: { id: true, name: true, username: true },
} as const;

// ---------------------------------------------------------------------------
// Reads (public)
// ---------------------------------------------------------------------------

export async function getPage(slug: string): Promise<WikiPageFull | null> {
  const page = await prisma.wikiPage.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      summary: true,
      createdAt: true,
      updatedAt: true,
      author: authorSelect,
      categories: {
        select: {
          category: {
            select: { id: true, name: true, slug: true, description: true },
          },
        },
      },
    },
  });

  if (!page) return null;

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    summary: page.summary,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    author: page.author,
    categories: page.categories.map((c) => c.category),
  };
}

export async function listPages(): Promise<WikiPageSummary[]> {
  return prisma.wikiPage.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, summary: true, updatedAt: true },
  });
}

export async function searchPages(q: string): Promise<WikiPageSummary[]> {
  const query = q.trim();
  if (!query) return [];

  return prisma.wikiPage.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, slug: true, summary: true, updatedAt: true },
  });
}

export async function listCategories(): Promise<CategoryWithCount[]> {
  const categories = await prisma.wikiCategory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { pages: true } },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    pageCount: c._count.pages,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  return prisma.wikiCategory.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, description: true },
  });
}

export async function getPagesInCategory(categorySlug: string): Promise<WikiPageSummary[]> {
  const rows = await prisma.wikiPage.findMany({
    where: { categories: { some: { category: { slug: categorySlug } } } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, summary: true, updatedAt: true },
  });
  return rows;
}

export async function getRedirect(slug: string): Promise<{ toSlug: string } | null> {
  const row = await prisma.wikiRedirect.findUnique({
    where: { fromSlug: slug },
    select: { toPage: { select: { slug: true } } },
  });
  if (!row) return null;
  return { toSlug: row.toPage.slug };
}

export async function listRedirects(): Promise<RedirectRow[]> {
  const rows = await prisma.wikiRedirect.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fromSlug: true,
      createdAt: true,
      toPage: { select: { slug: true, title: true } },
    },
  });
  return rows;
}

// ---------------------------------------------------------------------------
// Writes — pages (require editor)
// ---------------------------------------------------------------------------

/** Resolve category slugs to category ids, ignoring unknown slugs. */
async function resolveCategoryIds(categorySlugs: string[]): Promise<string[]> {
  if (categorySlugs.length === 0) return [];
  const found = await prisma.wikiCategory.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true },
  });
  return found.map((c) => c.id);
}

export async function createPage(input: PageInput): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await requireEditor();

    const title = input.title.trim();
    if (!title) return { ok: false, error: "Title is required." };

    const slug = slugify(input.slug || input.title);
    if (!isValidSlug(slug)) {
      return { ok: false, error: "Invalid slug." };
    }

    const existing = await prisma.wikiPage.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, error: `A page with the slug "${slug}" already exists.` };
    }

    const categoryIds = input.categorySlugs ? await resolveCategoryIds(input.categorySlugs) : [];

    // A real page takes precedence over any redirect at the same slug.
    await prisma.wikiRedirect.deleteMany({ where: { fromSlug: slug } });

    const page = await prisma.wikiPage.create({
      data: {
        title,
        slug,
        content: input.content,
        summary: input.summary ?? null,
        authorId: user.id,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
        revisions: {
          create: {
            title,
            content: input.content,
            comment: input.comment ?? null,
            editorId: user.id,
          },
        },
      },
      select: { slug: true },
    });

    revalidatePath("/wiki/dashboard");
    revalidatePath(`/wiki/${page.slug}`);
    revalidatePath("/wiki/admin");

    return { ok: true, data: { slug: page.slug } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function updatePage(
  slug: string,
  input: PageInput,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await requireEditor();

    const existing = await prisma.wikiPage.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (!existing) return { ok: false, error: "Page not found." };

    const title = input.title.trim();
    if (!title) return { ok: false, error: "Title is required." };

    const newSlug = slugify(input.slug || input.title);
    if (!isValidSlug(newSlug)) {
      return { ok: false, error: "Invalid slug." };
    }

    // If the slug changed, make sure the new slug isn't taken by another page.
    if (newSlug !== existing.slug) {
      const clash = await prisma.wikiPage.findUnique({
        where: { slug: newSlug },
        select: { id: true },
      });
      if (clash) {
        return { ok: false, error: `A page with the slug "${newSlug}" already exists.` };
      }
    }

    const categoryIds = input.categorySlugs
      ? await resolveCategoryIds(input.categorySlugs)
      : null;

    await prisma.$transaction(async (tx) => {
      await tx.wikiPage.update({
        where: { id: existing.id },
        data: {
          title,
          slug: newSlug,
          content: input.content,
          summary: input.summary ?? null,
          // authorId intentionally left unchanged
        },
      });

      if (categoryIds !== null) {
        await tx.wikiPageCategory.deleteMany({ where: { pageId: existing.id } });
        if (categoryIds.length > 0) {
          await tx.wikiPageCategory.createMany({
            data: categoryIds.map((categoryId) => ({ pageId: existing.id, categoryId })),
          });
        }
      }

      await tx.pageRevision.create({
        data: {
          pageId: existing.id,
          title,
          content: input.content,
          comment: input.comment ?? null,
          editorId: user.id,
        },
      });

      // When the slug changes: keep old links working by creating a redirect
      // from the old slug to this page, and remove any redirect that pointed
      // at the new slug (the page now owns it directly).
      if (newSlug !== existing.slug) {
        await tx.wikiRedirect.upsert({
          where: { fromSlug: existing.slug },
          create: { fromSlug: existing.slug, toPageId: existing.id },
          update: { toPageId: existing.id },
        });
        await tx.wikiRedirect.deleteMany({ where: { fromSlug: newSlug } });
      }
    });

    revalidatePath("/wiki/dashboard");
    revalidatePath("/wiki/admin");
    revalidatePath(`/wiki/${existing.slug}`);
    revalidatePath(`/wiki/${newSlug}`);
    revalidatePath(`/wiki/${newSlug}/history`);

    return { ok: true, data: { slug: newSlug } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function deletePage(slug: string): Promise<ActionResult> {
  try {
    await requireEditor();

    const existing = await prisma.wikiPage.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "Page not found." };

    await prisma.wikiPage.delete({ where: { id: existing.id } });

    revalidatePath("/wiki/dashboard");
    revalidatePath("/wiki/admin");
    revalidatePath(`/wiki/${slug}`);

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

// ---------------------------------------------------------------------------
// Writes — categories (require editor)
// ---------------------------------------------------------------------------

/** Resolve page slugs to page ids, ignoring unknown slugs. */
async function resolvePageIds(pageSlugs: string[]): Promise<string[]> {
  if (pageSlugs.length === 0) return [];
  const found = await prisma.wikiPage.findMany({
    where: { slug: { in: pageSlugs } },
    select: { id: true },
  });
  return found.map((p) => p.id);
}

export async function createCategory(
  input: CategoryInput,
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireEditor();

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Name is required." };

    const slug = slugify(input.slug || input.name);
    if (!isValidSlug(slug)) {
      return { ok: false, error: "Invalid slug." };
    }

    const existing = await prisma.wikiCategory.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, error: `A category with the slug "${slug}" already exists.` };
    }

    const pageIds = input.pageSlugs ? await resolvePageIds(input.pageSlugs) : [];

    const category = await prisma.wikiCategory.create({
      data: {
        name,
        slug,
        description: input.description ?? null,
        pages: {
          create: pageIds.map((pageId) => ({ pageId })),
        },
      },
      select: { slug: true },
    });

    revalidatePath("/wiki/admin");
    revalidatePath(`/wiki/category/${category.slug}`);

    return { ok: true, data: { slug: category.slug } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireEditor();

    const existing = await prisma.wikiCategory.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) return { ok: false, error: "Category not found." };

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Name is required." };

    const newSlug = slugify(input.slug || input.name);
    if (!isValidSlug(newSlug)) {
      return { ok: false, error: "Invalid slug." };
    }

    if (newSlug !== existing.slug) {
      const clash = await prisma.wikiCategory.findUnique({
        where: { slug: newSlug },
        select: { id: true },
      });
      if (clash) {
        return { ok: false, error: `A category with the slug "${newSlug}" already exists.` };
      }
    }

    const pageIds = input.pageSlugs ? await resolvePageIds(input.pageSlugs) : null;

    await prisma.$transaction(async (tx) => {
      await tx.wikiCategory.update({
        where: { id },
        data: {
          name,
          slug: newSlug,
          description: input.description ?? null,
        },
      });

      if (pageIds !== null) {
        await tx.wikiPageCategory.deleteMany({ where: { categoryId: id } });
        if (pageIds.length > 0) {
          await tx.wikiPageCategory.createMany({
            data: pageIds.map((pageId) => ({ pageId, categoryId: id })),
          });
        }
      }
    });

    revalidatePath("/wiki/admin");
    revalidatePath(`/wiki/category/${existing.slug}`);
    revalidatePath(`/wiki/category/${newSlug}`);

    return { ok: true, data: { slug: newSlug } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireEditor();

    const existing = await prisma.wikiCategory.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) return { ok: false, error: "Category not found." };

    await prisma.wikiCategory.delete({ where: { id } });

    revalidatePath("/wiki/admin");
    revalidatePath(`/wiki/category/${existing.slug}`);

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

// ---------------------------------------------------------------------------
// Writes — redirects (require editor)
// ---------------------------------------------------------------------------

export async function createRedirect(
  input: RedirectInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireEditor();

    const fromSlug = slugify(input.fromSlug);
    if (!isValidSlug(fromSlug)) {
      return { ok: false, error: "Invalid slug." };
    }

    // A page already occupying that slug would make the redirect unreachable.
    const pageClash = await prisma.wikiPage.findUnique({
      where: { slug: fromSlug },
      select: { id: true },
    });
    if (pageClash) {
      return { ok: false, error: "A page already uses that slug." };
    }

    const target = await prisma.wikiPage.findUnique({
      where: { slug: input.toPageSlug },
      select: { id: true, slug: true },
    });
    if (!target) {
      return { ok: false, error: "Target page not found." };
    }

    // Self-loop guard.
    if (fromSlug === target.slug) {
      return { ok: false, error: "A redirect cannot point to itself." };
    }

    const existing = await prisma.wikiRedirect.findUnique({
      where: { fromSlug },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, error: "That redirect already exists." };
    }

    const redirect = await prisma.wikiRedirect.create({
      data: { fromSlug, toPageId: target.id },
      select: { id: true },
    });

    revalidatePath("/wiki/admin");
    revalidatePath(`/wiki/${fromSlug}`);

    return { ok: true, data: { id: redirect.id } };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  try {
    await requireEditor();

    await prisma.wikiRedirect.delete({ where: { id } });

    revalidatePath("/wiki/admin");

    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: permissionError(err) };
  }
}
