import Link from "next/link";
import { Plus } from "lucide-react";
import { listPages } from "@/app/wiki/action";
import { getCurrentUser, canEdit } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import PageSearch from "./PageSearch";

export const metadata = {
  title: "All pages — PolySouls Wiki",
};

export default async function DashboardPage() {
  const [pages, user] = await Promise.all([listPages(), getCurrentUser()]);
  const editable = canEdit(user?.role);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All pages</h1>
          <p className="text-muted-foreground">
            Browse and search every page in the wiki.
          </p>
        </div>
        {editable && (
          <Button asChild>
            <Link href="/wiki/new">
              <Plus className="size-4" />
              New page
            </Link>
          </Button>
        )}
      </div>

      <PageSearch initialPages={pages} />
    </div>
  );
}
