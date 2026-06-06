import { notFound, redirect } from "next/navigation";
import { getCurrentUser, canEdit } from "@/lib/permissions";
import { getPage, listCategories } from "@/app/wiki/action";
import PageForm, { type PageFormInitial } from "@/components/wiki/PageForm";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Edit page — PolySouls Wiki",
};

export default async function WikiEditPage({ params }: EditPageProps) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!canEdit(user?.role)) {
    redirect(`/login?redirect=/wiki/edit/${slug}`);
  }

  const [page, categories] = await Promise.all([getPage(slug), listCategories()]);
  if (!page) notFound();

  const initial: PageFormInitial = {
    title: page.title,
    slug: page.slug,
    summary: page.summary ?? "",
    content: page.content,
    categorySlugs: page.categories.map((c) => c.slug),
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Edit page</h1>
      <p className="mb-8 text-muted-foreground">
        Editing <span className="font-medium text-foreground">{page.title}</span>.
        Saving adds a new entry to the page history.
      </p>
      <PageForm
        mode="edit"
        existingSlug={page.slug}
        categories={categories}
        initial={initial}
      />
    </div>
  );
}
