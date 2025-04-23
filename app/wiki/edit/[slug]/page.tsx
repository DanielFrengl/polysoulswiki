// app/wiki/edit/[slug]/page.tsx (or appropriate path)

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Adjust path if needed
import PageForm from "@/components/wiki/PageForm"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WikiEditPage() {
  const params = useParams();
  const router = useRouter();

  // State to hold the data fetched and potentially modified, using 'initialData'
  const [initialData, setInitialData] = useState<{
    title: string;
    slug: string;
    content: string;
  } | null>(null);

  // State to track loading status for fetching
  const [isLoading, setIsLoading] = useState(true);
  // State to track saving status
  const [isSaving, setIsSaving] = useState(false);

  // Store the original slug from the URL params separately
  const originalSlug = Array.isArray(params?.slug)
    ? params.slug[0]
    : (params?.slug as string | undefined);

  // Fetch initial data
  useEffect(() => {
    if (!originalSlug) {
      console.error("Slug parameter is missing.");
      toast.error("Page identifier missing.");
      setIsLoading(false);
      router.replace("/wiki/home");
      return;
    }
    setIsLoading(true);
    const fetchData = async () => {
      const { data, error } = await createClient
        .from("wiki_pages")
        .select("title, slug, content")
        .eq("slug", originalSlug)
        .single();

      if (error) {
        console.error("Error fetching page data:", error);
        toast.error("Failed to load page data.");
        setInitialData(null); // Use setInitialData
      } else if (data) {
        setInitialData(data); // Use setInitialData
      } else {
        console.warn(`No page found for slug: ${originalSlug}`);
        toast.error("Page not found.");
        setInitialData(null); // Use setInitialData
      }
      setIsLoading(false);
    };

    fetchData();
  }, [originalSlug, router]); // Depend on originalSlug

  const handleFieldChange = (
    field: "title" | "slug" | "content",
    value: string
  ) => {
    // Log what's coming in (keep this for debugging)
    console.log(`>>> handleFieldChange: Field='${field}', Value='${value}'`);

    // Use functional update form of setInitialData
    setInitialData((currentState) => {
      // Check if currentState is null (edge case, though unlikely if called from form)
      if (!currentState) {
        console.warn(
          ">>> handleFieldChange: currentState was null, cannot update."
        );
        return null; // Or handle appropriately
      }

      const newState = { ...currentState, [field]: value };
      // Log the state object we are about to set (keep this for debugging)
      console.log(
        `>>> handleFieldChange: Setting new state based on previous:`,
        newState
      );
      return newState; // Return the new state object
    });
  };

  // Function to save the changes to Supabase
  const handleSave = async () => {
    // Ensure we have data and the original slug to work with
    if (!initialData || !originalSlug) {
      // Check initialData
      toast.error("Cannot save, data is missing.");
      return;
    }

    setIsSaving(true);

    // Log the data being sent
    const dataToUpdate = {
      title: initialData.title, // Use initialData.title
      content: initialData.content, // Use initialData.content
      slug: initialData.slug, // Use initialData.slug
      updated_at: new Date().toISOString(),
    };
    console.log(
      ">>> handleSave: Data being sent to Supabase update:",
      dataToUpdate
    ); // Log the data object
    console.log(
      ">>> handleSave: Finding record with original slug:",
      originalSlug
    );

    const { error } = await createClient
      .from("wiki_pages")
      .update(dataToUpdate) // Send the data object
      .eq("slug", originalSlug); // Find the record using the ORIGINAL slug

    setIsSaving(false); // Ensure this is always called

    if (!error) {
      toast.success("Page updated successfully!");
      // Redirect to the NEW slug's URL
      router.push(`/wiki/${initialData.slug}`); // Use initialData.slug
      // router.refresh(); // Optional: uncomment if needed
    } else {
      console.error("Error updating page:", error);
      toast.error(`Failed to update page. Error: ${error.message}`);
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-10">Loading editor...</div>;
  }

  // Use initialData for check
  if (!initialData && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        Page not found or could not be loaded.
      </div>
    );
  }

  // Render the form only when initialData is available
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-xl font-semibold mb-6">Edit Page</h1>
      {/* Check initialData before rendering form */}
      {initialData && (
        <>
          <PageForm
            initialData={initialData} // Pass initialData to PageForm
            onChange={handleFieldChange}
            onSubmit={() => {
              /* Empty ok */
            }}
          />

          <div className="mt-6">
            {/* Disable button based on initialData existence as well */}
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading || !initialData}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
