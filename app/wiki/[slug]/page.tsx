// app/wiki/[slug]/page.tsx (Server Component)
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import ClientWikiPage from "./ClientWikiPage"; // <- we'll create this
import { use, useEffect } from "react";
import { deletePage } from "../action"; // Adjust the import path as needed

export default async function WikiPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from("wiki_pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !page) return notFound();

  const date = formatDateTime(page.created_at);

  return <ClientWikiPage page={page} date={date} />;
}
