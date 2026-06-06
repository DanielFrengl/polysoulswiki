import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/app/wiki/action";
import { listRevisions } from "@/app/wiki/revisions";
import { getCurrentUser } from "@/lib/permissions";
import { canEdit } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import WikiContent from "@/components/wiki/WikiContent";
import TableOfContents from "@/components/wiki/TableOfContents";
import PageActions from "@/components/wiki/PageActions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page not found — PolySouls Wiki" };
  return {
    title: `${page.title} — PolySouls Wiki`,
    description: page.summary ?? undefined,
  };
}

export default async function WikiPage({ params }: PageProps) {
  const { slug } = await params;

  const [page, user] = await Promise.all([getPage(slug), getCurrentUser()]);
  if (!page) notFound();

  const revisions = await listRevisions(slug);
  const lastEditor = revisions[0]?.editor ?? page.author;
  const editable = canEdit(user?.role);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/wiki/home">Wiki</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/wiki/dashboard">Pages</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{page.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <header className="mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
              {editable && <PageActions slug={page.slug} title={page.title} />}
            </div>

            {page.summary && (
              <p className="mt-3 text-lg text-muted-foreground">{page.summary}</p>
            )}

            {page.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {page.categories.map((category) => (
                  <Badge key={category.id} variant="secondary" asChild>
                    <Link href={`/wiki/category/${category.slug}`}>
                      {category.name}
                    </Link>
                  </Badge>
                ))}
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">
              {lastEditor ? (
                <>
                  Last updated by{" "}
                  <span className="text-foreground">
                    {lastEditor.username ?? lastEditor.name}
                  </span>{" "}
                  · {formatDate(page.updatedAt)}
                </>
              ) : (
                <>Last updated {formatDate(page.updatedAt)}</>
              )}
            </p>
          </header>

          <Separator className="mb-8" />

          <WikiContent html={page.content} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents html={page.content} />
          </div>
        </aside>
      </div>
    </div>
  );
}
