"use server";
import { createClient } from "@/utils/supabase/server";

export type Nav = {
    id: number,
    title: string,
    position: number,
    dropdown: boolean,

}

export type Links = {
    id: number,
    title: string,
    position: number,
    nav: number,
}

export async function fetchNav() {
    const supabase = await createClient();
  
    const { data, error } = await supabase
    .from("wiki_nav")
    .select("id, title, position, dropdown")
    .order("position", { ascending: false });
  
    if (error) {
      console.error("Error fetching page:", error);
      throw error;
    }
  
    return data;
  }


export async function createNav(nav: Nav): Promise<void> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("wiki_nav")
        .insert([nav]);

    if (error) {
        console.error("Error creating nav:", error);
        throw error;
    }

    console.log("Nav created successfully:", data);
}

// LINKS


export async function fetchLinksInNav(nav: number) {
    const supabase = await createClient();

    const {data, error} = await supabase
    .from("wiki_nav_links")
    .select("*")

    if (error) {
        console.error("Error fetching links in nav:", error)
        throw error;
    }

    return data;
}

export async function createLink(links: Links): Promise<void> {
    const supabase = await createClient();
    const {data, error} = await supabase
    .from("wiki_nav_links")
    .insert([links])
}