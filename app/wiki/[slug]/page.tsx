import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getRedirect } from "@/app/wiki/action";
import { listRevisions } from "@/app/wiki/revisions";
import { isWatching } from "@/app/wiki/watch";
import { getCurrentUser } from "@/lib/permissions";
import { canEdit } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import WatchButton from "@/components/wiki/WatchButton";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
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

export default async function WikiPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { from } = await searchParams;

  const [page, user] = await Promise.all([getPage(slug), getCurrentUser()]);

  if (!page) {
    const redir = await getRedirect(slug);
    if (redir) {
      redirect(`/wiki/${redir.toSlug}?from=${encodeURIComponent(slug)}`);
    }
    notFound();
  }

  const revisions = await listRevisions(slug);
  const lastEditor = revisions[0]?.editor ?? page.author;
  const editable = canEdit(user?.role);
  const watching = user ? await isWatching(page.slug) : false;

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
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/wiki/${page.slug}/talk`}>
                    <MessagesSquare className="size-4" />
                    Talk
                  </Link>
                </Button>
                {user && (
                  <WatchButton pageSlug={page.slug} initialWatching={watching} />
                )}
                {editable && <PageActions slug={page.slug} title={page.title} />}
              </div>
            </div>

            {page.summary && (
              <p className="mt-3 text-lg text-muted-foreground">{page.summary}</p>
            )}

            {from && (
              <p className="mt-2 text-sm text-muted-foreground">
                Redirected from{" "}
                <span className="font-mono">{decodeURIComponent(from)}</span>
              </p>
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
          <div className="sticky top-24 space-y-6">
            {page.infobox && page.infobox.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{page.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-y-2 text-sm">
                    {page.infobox.map((field, i) => (
                      <div
                        key={`${field.label}-${i}`}
                        className="grid grid-cols-[minmax(0,5rem)_minmax(0,1fr)] gap-2"
                      >
                        <dt className="text-muted-foreground font-medium break-words">
                          {field.label}
                        </dt>
                        <dd className="break-words">{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
            <TableOfContents html={page.content} />
          </div>
        </aside>
      </div>
    </div>
  );
}
