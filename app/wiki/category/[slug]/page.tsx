import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getPagesInCategory } from "@/app/wiki/action";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found — PolySouls Wiki" };
  return {
    title: `${category.name} — PolySouls Wiki`,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const pages = await getPagesInCategory(slug);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/wiki/dashboard">Pages</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Category
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {pages.length} page{pages.length === 1 ? "" : "s"}
        </p>
      </header>

      {pages.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No pages yet</EmptyTitle>
            <EmptyDescription>
              No pages have been added to this category.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {pages.map((page) => (
            <li key={page.id}>
              <Link href={`/wiki/${page.slug}`} className="block">
                <Card className="transition-colors hover:border-primary">
                  <CardContent>
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-medium">{page.title}</h2>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(page.updatedAt)}
                      </span>
                    </div>
                    {page.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {page.summary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
