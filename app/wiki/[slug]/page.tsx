import { supabase } from "@/app/utils/supabase/client";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  const { data: pages } = await supabase.from("wiki_pages").select("slug");

  return pages?.map((page) => ({ slug: page.slug })) || [];
}

export default async function WikiPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: page } = await supabase
    .from("wiki_pages")
    .select("id, title, content, slug, created_at")
    .eq("slug", params.slug)
    .single();

  if (!page) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-10 prose dark:prose-invert">
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
      <Link
        href={`/wiki/edit/${page.slug}`}
        className="text-sm text-blue-500 hover:underline block mt-6"
      >
        Edit this page
      </Link>
    </div>
  );
}
