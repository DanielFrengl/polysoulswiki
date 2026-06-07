import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/app/wiki/action";
import { listTalkMessages } from "@/app/wiki/talk";
import { getCurrentUser } from "@/lib/permissions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TalkThread from "@/components/wiki/TalkThread";

interface TalkPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TalkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return { title: `Talk: ${page.title} — PolySouls Wiki` };
}

export default async function TalkPage({ params }: TalkPageProps) {
  const { slug } = await params;

  const page = await getPage(slug);
  if (!page) notFound();

  const [messages, user] = await Promise.all([
    listTalkMessages(slug),
    getCurrentUser(),
  ]);

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
            <BreadcrumbPage>Talk</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Talk: {page.title}</h1>
        <p className="mt-1 text-muted-foreground">Discussion for this page.</p>
      </div>

      <TalkThread
        pageSlug={slug}
        messages={messages}
        signedIn={!!user}
      />
    </div>
  );
}
