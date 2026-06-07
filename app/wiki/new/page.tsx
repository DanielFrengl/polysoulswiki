import { redirect } from "next/navigation";
import { getCurrentUser, canEdit } from "@/lib/permissions";
import { listCategories } from "@/app/wiki/action";
import PageForm from "@/components/wiki/PageForm";

export const metadata = {
  title: "New page — PolySouls Wiki",
};

export default async function NewPage() {
  const user = await getCurrentUser();
  if (!canEdit(user?.role)) {
    redirect("/login?redirect=/wiki/new");
  }

  const categories = await listCategories();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Create a page</h1>
      <p className="mb-8 text-muted-foreground">
        Add a new page to the wiki. The first save creates its revision history.
      </p>
      <PageForm mode="create" categories={categories} />
    </div>
  );
}
