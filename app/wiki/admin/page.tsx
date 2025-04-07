// app/wiki/admin/page.tsx
import { supabase } from "@/app/utils/supabase/client";
import Link from "next/link";

export default async function WikiAdminPage() {
  const { data: pages } = await supabase
    .from("wiki_pages")
    .select("id, title, slug, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Wiki Admin</h1>
      <div className="space-y-4">
        {pages?.map((page) => (
          <div
            key={page.id}
            className="border p-4 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-medium">{page.title}</h2>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(page.updated_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/wiki/${page.slug}`}
                className="text-blue-500 hover:underline text-sm"
              >
                View
              </Link>
              <Link
                href={`/wiki/edit/${page.slug}`}
                className="text-orange-500 hover:underline text-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
