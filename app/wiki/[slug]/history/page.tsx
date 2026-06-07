import Link from "next/link";
import { notFound } from "next/navigation";
import { getPage } from "@/app/wiki/action";
import { listRevisions } from "@/app/wiki/revisions";
import { getCurrentUser, canEdit } from "@/lib/permissions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import RevisionHistory from "@/components/wiki/RevisionHistory";

interface HistoryPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Revision history — PolySouls Wiki",
};

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { slug } = await params;

  const page = await getPage(slug);
  if (!page) notFound();

  const [revisions, user] = await Promise.all([
    listRevisions(slug),
    getCurrentUser(),
  ]);
  const editable = canEdit(user?.role);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/wiki/${slug}`}>{page.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>History</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">Revision history</h1>
      <p className="mb-8 text-muted-foreground">
        Changes to <span className="font-medium text-foreground">{page.title}</span>,
        newest first.
      </p>

      <RevisionHistory revisions={revisions} editable={editable} />
    </div>
  );
}
