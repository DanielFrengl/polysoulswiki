import Link from "next/link";
import type { Metadata } from "next";
import { FolderTree } from "lucide-react";
import { listCategories } from "@/app/wiki/action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Categories — PolySouls Wiki",
  description: "Browse the PolySouls wiki by category.",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Browse the wiki by topic.</p>
      </header>

      {categories.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No categories yet</EmptyTitle>
            <EmptyDescription>Categories will appear here once created.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link key={category.id} href={`/wiki/category/${category.slug}`} className="block">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <FolderTree className="text-muted-foreground size-4" />
                      {category.name}
                    </span>
                    <Badge variant="secondary">
                      {category.pageCount} page{category.pageCount === 1 ? "" : "s"}
                    </Badge>
                  </CardTitle>
                  {category.description && (
                    <CardDescription>{category.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
