
"use server";
import { createClient } from "@/utils/supabase/server";
import { WikiCategory } from "./admin/page";
import { WikiCategoryEdit } from "./admin/page";

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

  export async function fetchPagesInCategories(categoryId: string) {
    // Basic input validation
    if (!categoryId) {
        console.error("fetchPagesInCategories Error: categoryId parameter is missing or invalid.");
        return []; // Return empty array if no categoryId provided
    }

    // Use the server client for server actions
    const supabase = await createClient();

    try {
        // Step 1: Fetch the page_ids from the join table ('wiki_page_categories')
        const { data: joinData, error: joinError } = await supabase
            .from("wiki_page_categories") // Your join table name
            .select("page_id")            // Select only the foreign key to the pages table
            .eq("category_id", categoryId); // Filter by the provided category ID

        if (joinError) {
            console.error("Error fetching page IDs from wiki_page_categories:", joinError.message);
            // Decide: return [] or throw new Error(...) depending on how you want to handle errors upstream
            return [];
        }

        // If no page associations are found for this category, return an empty array
        if (!joinData || joinData.length === 0) {
            console.log(`No pages found associated with category ID: ${categoryId}`);
            return [];
        }

        // Extract the page IDs into a simple array ['id1', 'id2', ...]
        const pageIds = joinData.map(item => item.page_id);

        // Step 2: Fetch the actual page details from the 'pages' table using the IDs found
        // --- IMPORTANT: Replace 'pages' with the actual name of your wiki pages table ---
        const { data: pagesData, error: pagesError } = await supabase
            .from('wiki_pages') // <-- Replace 'pages' with your actual table name for wiki pages
            .select('id, title, slug, created_at') // Select the columns matching the WikiPage interface
            .in('id', pageIds) // Filter pages where the ID is in the list we gathered
            .order('title', { ascending: true }); // Optional: Order the results

        if (pagesError) {
            console.error("Error fetching page details from pages table:", pagesError.message);
            return [];
        }

        // Return the array of page objects, or an empty array if null/undefined
        return pagesData || [];

    } catch (error) {
        // Catch unexpected errors (e.g., network issues, client creation failure)
        console.error("Unexpected error in fetchPagesInCategories:", error instanceof Error ? error.message : error);
        return [];
    }
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


  

  export async function updateCategory(id: string, data: {
    name: string;
    slug: string;
    description: string;
    hasPages: string[]
  }) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("wiki_categories")
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description,
      })
      .eq("id", id);
      console.log("Updated category successfully")

  
    if (error) {
      throw new Error(error.message);
    }

    const category = await fetchCategoryBySlug(data.slug)
    const pageIds = await fetchPageIdsFromSlugs(data.hasPages)

    await updatePagesForCategory(category.id, pageIds)
    console.log("Category created and pages linked:", category.id, pageIds);
  
  }

  