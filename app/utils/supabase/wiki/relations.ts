import { supabase } from "../client";

export async function addPageToCategory(pageId: string, categoryId: string) {
    const { data, error } = await supabase.from("wiki_page_categories").insert([
      { page_id: pageId, category_id: categoryId }
    ]);
    if (error) throw new Error(error.message);
    return data;
  }
  