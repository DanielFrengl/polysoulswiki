
"use server";
import { createClient } from "@/utils/supabase/server";

export async function deletePage(slug: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wiki_pages")
    .delete()
    .eq("slug", slug);

  if (error) {
    console.error("Error deleting page:", error);
    throw error;
  }
  console.log("Page deleted successfully!");
}

export async function updatePage(
  slug: string,
  title: string,
  content: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wiki_pages")
    .update({ title, content })
    .eq("slug", slug);

  if (error) {
    console.error("Error updating page:", error);
    throw error;
  }
}

export async function createPage(
  title: string,
  slug: string,
  content: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wiki_pages")
    .insert({ title, slug, content });

  if (error) {
    console.error("Error creating page:", error);
    throw error;
  }
}

export async function fetchPages() {
  const supabase = await createClient();

  const { data, error } = await supabase
  .from("wiki_pages")
  .select("id, title, slug, created_at")
  .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching page:", error);
    throw error;
  }

  return data;
}

export async function fetchPagesById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("id, title, slug, content")
    .eq("id", id)
    .single();
}

export async function fetchPagesByTitle(title: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("id, title, slug, content")
    .eq("title", title)
    .single();

  if (error) {
    console.error("Error fetching page:", error);
    throw error;
  }

  return data;
}
// CATEGORY

export async function createCategory(
  name: string,
  slug: string,
  description: string,
  hasPages: string[]
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wiki_categories")
    .insert({ name, slug, description});

  const { error: error2 } = await supabase
    .from("wiki_page_categories")
    .insert(
      hasPages.map((pageId) => ({
        page_id: pageId,
        category_id: slug,
      }))
    );
  if (error2) {
    console.error("Error creating page-category relationship:", error2);
    throw error2;
  }

  if (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}