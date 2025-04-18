
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


  export async function fetchPageIdsFromSlugs(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wiki_pages")
      .select("id, slug") 
      .in("slug", slugs);

    if (error) {  
      console.error("Error fetching page IDs from slugs:", error.message);
      return [];
    }

    return data.map((page) => page.id);
  }


  // CATEGORY - PAGE RELATION ----------------------------------------------

  export async function fetchPagesInCategories(category_id: string) {
    const supabase = await createClient();
    const {data, error} = await supabase
    .from("wiki_page_categories")
    .select("page_id")
    .eq("category_id", category_id)
    
    if (error) {
      console.log("Error fetching pages in categories", error)
    }

    return data;
  }



  // CATEGORY --------------------------------------------------------------

  export async function fetchCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
  .from("wiki_categories")
  .select("id, name, slug, description")
  .order("name")

  if (error) {
    console.error("Error fetching category:", error);
    throw error;
  }

  return data;
}

  export async function fetchCategoryBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wiki_categories")
      .select("id")
      .eq("slug", slug)
      .single();
    if (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
    return data;

  }

  export async function updatePagesForCategory(
    categoryId: string,
    pageIds: string[]
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("wiki_page_categories")
      .upsert(
        pageIds.map((pageId) => ({
          page_id: pageId,
          category_id: categoryId,
        }))
      );

    if (error) {
      console.error("Error updating pages for category:", error.message);
      throw error;
    }

    console.log("Pages successfully linked to category.");
  }

  export async function createCategory(
    name: string,
    slug: string,
    description: string,
    hasPages: string[]
  ): Promise<void> {


  console.log("Attempting to insert category with:", { name, slug, description }); // <-- ADD THIS LOG
    const supabase = await createClient();
    const { error } = await supabase
      .from("wiki_categories")
      .insert({ name, slug, description });
  
    if (error) {
      console.error("Error creating category:", error.message);
      throw error;
    }
    
    // Fetch the newly created category by slug
    const category = await fetchCategoryBySlug(slug);
  
    // ✅ Convert slugs to page IDs before linking
    const pageIds = await fetchPageIdsFromSlugs(hasPages);
  
    // ✅ Now update the linking table
    await updatePagesForCategory(category.id, pageIds);
  
    console.log("Category created and pages linked:", category.id);
  }
  