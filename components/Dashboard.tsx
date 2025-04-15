"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { handleSignout } from "@/app/utils/supabase/logout";
import { LogOut } from "lucide-react";
import { Menubar, MenubarMenu, MenubarTrigger } from "./ui/menubar";
import WikiEditor from "./wiki/WikiEditor";
import { useRouter } from "next/navigation";
import { createPage } from "@/app/wiki/action";
import { toast } from "sonner";

const Dashboard = () => {
  const [activeEditor, setActiveEditor] = useState<"page" | "category" | null>(
    null
  );

  const router = useRouter();

  const handleCreate = () => {
    try {
      createPage("title", "slug", "content");
      router.push("/wiki" + `/${"slug"}`);
    } catch (error) {
      console.error("Error creating page:", error);
      toast.error("Error creating page: " + error);
    }
  };

  const content = (content: string) => {
    console.log(content);
  };

  return (
    <Card className="w-[90vw] mx-auto">
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
            <LogOut />
            Log out
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger onClick={() => setActiveEditor(null)}>
              Admin
            </MenubarTrigger>
            <MenubarTrigger onClick={() => setActiveEditor("page")}>
              Create a Page
            </MenubarTrigger>
            <MenubarTrigger onClick={() => setActiveEditor("category")}>
              Create a Category
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
        {activeEditor === null && <div className="space-y-4 mt-4"></div>}

        {activeEditor === "page" && (
          
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

export default Dashboard;
