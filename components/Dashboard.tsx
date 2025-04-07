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
import TinyMCEEditor from "@/ui/components/TinyMCEEditor";

const Dashboard = () => {
  const [activeEditor, setActiveEditor] = useState<"page" | "category" | null>(
    null
  );

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
            <MenubarTrigger onClick={() => setActiveEditor("page")}>
              Create a Page
            </MenubarTrigger>
            <MenubarTrigger onClick={() => setActiveEditor("category")}>
              Create a Category
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>

        {activeEditor === "page" && (
          <div className="space-y-4 mt-4">
            <Label htmlFor="page-name">Page Name</Label>
            <Input id="page-name" placeholder="Enter page name" />
            <TinyMCEEditor initialValue="" onChange={content} />
            <Button variant="outline" onClick={() => setActiveEditor(null)}>
              Create Page
            </Button>
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

export default Dashboard;
