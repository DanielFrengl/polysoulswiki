import { supabase } from "../client";

export async function createWikiPage(title: string, content: string, authorId: string) {
  const { data, error } = await supabase.from("wiki_pages").insert([
    { title, content, author_id: authorId }
  ]);


  if (error) throw new Error(error.message);
  return data;
}

export async function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .substring(0, 50);
}