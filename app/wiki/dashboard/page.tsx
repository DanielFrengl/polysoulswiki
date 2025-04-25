"use client";

import React, { useState } from "react";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleSignout } from "@/app/utils/supabase/logout";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCategory, createPage } from "@/app/wiki/action";
import { toast } from "sonner";
import WikiAdminPage from "../admin/page";
import PageForm from "@/components/wiki/PageForm";
import CategoryForm from "@/components/wiki/CategoryForm";

const WikiDashboard = () => {
  const [activeEditor, setActiveEditor] = useState<"page" | "category" | null>(
    null
  );

  const router = useRouter();

  const handleTabClick = (tab: "page" | "category" | null) => {
    if (tab === "page") {
    }
    if (tab === "category") {
    }
    setActiveEditor(tab);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreatePage = () => {
    try {
      createPage(initialData.title, initialData.slug, initialData.content);
      toast.success("Page created successfully");
      router.push(`/wiki/${initialData.slug}`);
    } catch (error) {
      console.error("Error creating page:", error);
      toast.error("Error creating page: " + error);
    }
  };

  const handleCreateCategory = async () => {
    // Basic client-side check
    if (!initialDataCategory.name || !initialDataCategory.description) {
      toast.error("Category Name and Description cannot be empty.");
      return; // Stop execution
    }
    // ... rest of the function
    setIsSaving(true); // Use loading state
    try {
      await createCategory(
        // Add await here
        initialDataCategory.name,
        initialDataCategory.slug, // Ensure slug is generated even for empty name?
        initialDataCategory.description,
        initialDataCategory.hasPages
      );
      toast.success(
        "Category created successfully: " + initialDataCategory.name
      );
      // Reset form state here
      setInitialDataCategory({
        id: "",
        name: "",
        description: "",
        slug: "",
        hasPages: [],
      });
    } catch (error: any) {
      // Catch the error properly
      console.error("Error creating category:", error);
      toast.error(
        "Error creating category: " + (error.message || "Unknown error")
      );
    } finally {
      setIsSaving(false); // Reset loading state
    }
  };

  const [initialData, setInitialData] = useState<{
    title: string;
    slug: string;
    content: string;
  }>({
    title: "",
    slug: "",
    content: "",
  });

  const [initialDataCategory, setInitialDataCategory] = useState<{
    id: string;
    name: string;
    description: string;
    slug: string;
    hasPages: string[];
  }>({
    id: "",
    name: "",
    description: "",
    slug: "",
    hasPages: [],
  });

  const handleFieldChange = (
    field: "title" | "slug" | "content",
    value: string
  ) => {
    console.log(`Field changed: ${field}, New value: ${value}`);
    setInitialData((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  };

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

  return (
    <Card className="w-[70vw] mx-auto mt-25">
      <CardHeader>
        <div className="flex items-center justify-between space-x-2">
          <div>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Edit your profile details below.</CardDescription>
          </div>
          <Button
            variant="destructive"
            className="hover:opacity-80"
            onClick={handleSignout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex md:flex-row flex-col gap-4 mb-4">
          <Button
            variant={activeEditor === null ? "default" : "outline"}
            onClick={() => handleTabClick(null)}
          >
            Admin
          </Button>
          <Button
            variant={activeEditor === "page" ? "default" : "outline"}
            onClick={() => handleTabClick("page")}
          >
            Create a Page
          </Button>
          <Button
            variant={activeEditor === "category" ? "default" : "outline"}
            onClick={() => handleTabClick("category")}
          >
            Create a Category
          </Button>
        </div>

        {activeEditor === null && (
          <div className="space-y-4 mt-4">
            <WikiAdminPage />
          </div>
        )}

        {activeEditor === "page" && (
          <div className="space-y-4 mt-14">
            <PageForm
              initialData={initialData}
              onChange={handleFieldChange}
              onSubmit={() => {}}
            />
            <Button variant="default" onClick={handleCreatePage}>
              Create a page
            </Button>
          </div>
        )}

        {activeEditor === "category" && (
          <div className="space-y-4 mt-14">
            <CategoryForm
              initialData={initialDataCategory}
              onChange={handleFieldChangeCategory}
              onSubmit={() => {}}
            />
            <Button variant="outline" onClick={handleCreateCategory}>
              Create Category
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WikiDashboard;
