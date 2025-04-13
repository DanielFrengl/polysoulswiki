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

import WikiAdminPage from "../admin/page";
import PageForm from "@/components/wiki/PageForm";

const WikiDashboard = () => {
  const [activeEditor, setActiveEditor] = useState<"page" | "category" | null>(
    null
  );
  const handleTabClick = (tab: "page" | "category" | null) => {
    // Optionally reset forms when switching *to* a creation tab
    if (tab === "page") {
      // Decide if you want to reset every time the tab is clicked,
      // or only after successful submission (handled in submit function)
      // resetPageForm(); // Uncomment if you want reset on tab click
    }
    if (tab === "category") {
      // setCategoryName(''); // Uncomment if you want reset on tab click
    }
    setActiveEditor(tab);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [initialData, setInitialData] = useState<{
    title: string;
    slug: string;
    content: string;
  }>({
    title: "",
    slug: "",
    content: "",
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

  return (
    <Card className="w-[70vw] mx-auto">
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
        <div className="flex gap-4 mb-4">
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
          <div className="space-y-4 mt-4">
            <PageForm
              initialData={initialData}
              onChange={handleFieldChange}
              onSubmit={() => {
                // Add your submit logic here
              }}
            />
          </div>
        )}

        {activeEditor === "category" && (
          <div className="space-y-4 mt-4">
            <Label htmlFor="category-name">Category Name</Label>
            <Input id="category-name" placeholder="Enter category name" />
            <Button variant="outline" onClick={() => setActiveEditor(null)}>
              Create Category
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WikiDashboard;
