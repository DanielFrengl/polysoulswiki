// app/wiki/[slug]/page.tsx
import Link from "next/link";
import { supabase } from "@/app/utils/supabase/client";

const convertLinks = (text: string) => {
  return text.replace(/\[\[(.+?)\]\]/g, (match, p1) => {
    const slug = p1.trim().replace(/\s+/g, "_");
    return `<a class="text-blue-500 underline" href="/wiki/${slug}">${p1}</a>`;
  });
};

export default async function WikiPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    return (
      <div>
        <h1>Page not found</h1>
        <Link href={`/wiki/edit/${params.slug}`} className="text-blue-500">
          Create page
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: convertLinks(data.content || "") }}
      />
      <Link
        href={`/wiki/edit/${data.slug}`}
        className="text-blue-500 block mt-4"
      >
        Edit
      </Link>
    </div>
  );
}
