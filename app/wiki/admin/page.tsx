"use client";
import Link from "next/link";
import { fetchCategories, fetchPages, fetchPagesInCategories } from "../action"; // Assuming fetchPagesInCategories takes categoryId and returns WikiPage[]
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader, CardContent for better structure
import Loader from "@/components/ui/loader";
import CategoryForm from "@/components/wiki/CategoryForm";
import CategoryEdit from "@/components/wiki/CategoryEditor";
import CategoryPages from "@/components/wiki/CategoryPages";
import AllPages from "@/components/wiki/AllPages";

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  created_at: string;
}

interface WikiCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
}

type ViewMode = "categories" | "categoryPages" | "allPages" | "editCategory";

export default function WikiAdminPage() {
  // State for all pages (optional, could be removed if not showing "All Pages" view)
  const [allPages, setAllPages] = useState<WikiPage[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory | null>(
    null
  );
  const [categoryPages, setCategoryPages] = useState<WikiPage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const [initialDataCategory, setInitialDataCategory] = useState<{
    name: string;
    description: string;
    slug: string;
    hasPages: string[];
  }>({
    name: "",
    description: "",
    slug: "",
    hasPages: [],
  });

  const handleFieldChangeCategory = (
    field: "name" | "slug" | "description" | "hasPages",
    value: string | string[]
  ) => {
    console.log(`Field changed: ${field}, New value: ${value}`);
    setInitialDataCategory((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  };

  useEffect(() => {});

  // Fetch all categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Handle error display if needed
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch pages for the selected category when it changes
  useEffect(() => {
    if (selectedCategory) {
      const loadCategoryPages = async () => {
        setIsLoading(true);
        setCategoryPages([]); // Clear previous pages
        try {
          // Assuming fetchPagesInCategories takes category ID and returns the pages
          const pagesData = await fetchPagesInCategories(selectedCategory.id);
          setCategoryPages(pagesData);
        } catch (error) {
          console.error(
            `Failed to fetch pages for category ${selectedCategory.name}:`,
            error
          );
          // Handle error display if needed
        } finally {
          setIsLoading(false);
        }
      };
      loadCategoryPages();
      console.log(selectedCategory);
    }
  }, [selectedCategory]); // Dependency array ensures this runs when selectedCategory changes

  const handleCategoryClick = (category: WikiCategory) => {
    setSelectedCategory(category);
    setViewMode("categoryPages");
  };

  const handleCategoryEditingClick = (category: WikiCategory) => {
    setSelectedCategory(category);
    setViewMode("editCategory");
  };

  const handleBackView = () => {
    setSelectedCategory(selectedCategory);
    setViewMode("categoryPages");
  };

  // Handler for going back to the category list view
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryPages([]); // Clear category pages
    setViewMode("categories");
  };

  // --- Optional: Handler/State for showing all pages ---
  const handleShowAllPages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPages();
      setAllPages(data);
      setViewMode("allPages"); // Need to add "allPages" to ViewMode type and handle rendering
    } catch (error) {
      console.error("Failed to fetch all pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      {/* View: List of Categories */}
      {viewMode === "categories" && (
        <>
          <h1 className="p-2 mb-6 font-semibold text-2xl border-b">
            Wiki Categories
          </h1>
          {isLoading && <Loader />}
          {!isLoading && categories.length === 0 && <p>No categories found.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories?.map((category) => (
              <Card
                key={category.id}
                className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:opacity-50"
                onClick={() => handleCategoryClick(category)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Button onClick={handleShowAllPages} variant="outline">
              View All Pages
            </Button>
          </div>
        </>
      )}

      {/* View: Pages within a Selected Category */}
      {viewMode === "categoryPages" && selectedCategory && (
        <CategoryPages
          selectedCategory={selectedCategory}
          categoryPages={categoryPages}
          handleBackToCategories={handleBackToCategories}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleCategoryEditingClick={() =>
            handleCategoryEditingClick(selectedCategory)
          }
        />
      )}

      {viewMode === "editCategory" && selectedCategory && (
        <CategoryEdit
          selectedCategory={selectedCategory}
          categoryPages={categoryPages}
          handleBackView={handleBackView}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      {viewMode === "allPages" && (
        <AllPages
          allPages={allPages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleBackToCategories={handleBackToCategories}
        />
      )}
    </div>
  );
}
