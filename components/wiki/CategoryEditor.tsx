import { useState } from "react";
import { Button } from "../ui/button";
import Loader from "../ui/loader";
import CategoryForm from "@/components/wiki/CategoryForm";
import { updateCategory } from "@/app/wiki/action";
import { toast } from "sonner";

export type CategoryEditProps = {
  selectedCategory: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };

  categoryPages: {
    id: string;
    title: string;
    slug: string;
    created_at: string;
  }[];

  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  handleBackView: () => void;
};

export default function CategoryEdit({
  selectedCategory,
  categoryPages,
  handleBackView,
  isLoading,
  setIsLoading,
}: CategoryEditProps) {
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

  const handleUpdateCategory = () => {
    try {
      updateCategory(selectedCategory.id, initialDataCategory);
      toast.success("Category saved successfully");
    } catch (error) {
      console.error("Error creating page:", error);
      toast.error("Error creating page: " + error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <h1 className="p-2 font-semibold text-2xl">
          Editing: {selectedCategory.name}
        </h1>
        <Button variant="outline" onClick={handleBackView}>
          ← Go Back
        </Button>
      </div>
      {isLoading && <Loader />}
      {!isLoading && (
        <div className="space-y-4">
          <CategoryForm
            initialData={{
              ...selectedCategory,
              id: String(selectedCategory.id),
              hasPages: categoryPages.map((page) => page.title),
            }}
            onChange={handleFieldChangeCategory}
            onSubmit={() => {}}
          />
          <Button variant="default" onClick={handleUpdateCategory}>
            Save Category
          </Button>
        </div>
      )}
    </>
  );
}
