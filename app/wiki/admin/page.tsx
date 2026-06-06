import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentUser, canEdit, canAdmin } from "@/lib/permissions";
import { listPages, listCategories } from "@/app/wiki/action";
import { listUsers } from "@/app/wiki/admin/action";
import { Button } from "@/components/ui/button";
import AdminTabs from "./AdminTabs";

export const metadata = {
  title: "Admin — PolySouls Wiki",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!canEdit(user?.role)) {
    redirect("/login?redirect=/wiki/admin");
  }

  const isAdmin = canAdmin(user?.role);

  const [pages, categories, users] = await Promise.all([
    listPages(),
    listCategories(),
    isAdmin ? listUsers() : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin panel</h1>
          <p className="text-muted-foreground">
            Manage wiki pages, categories{isAdmin ? ", and users" : ""}.
          </p>
        </div>
        <Button asChild>
          <Link href="/wiki/new">
            <Plus className="size-4" />
            New page
          </Link>
        </Button>
      </div>

      <AdminTabs pages={pages} categories={categories} users={users} />
    </div>
  );
}
