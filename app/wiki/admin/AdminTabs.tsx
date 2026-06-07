"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPages from "./AdminPages";
import AdminCategories from "./AdminCategories";
import AdminUsers from "./AdminUsers";
import AdminRedirects from "./AdminRedirects";
import type {
  AdminUserRow,
  CategoryWithCount,
  RedirectRow,
  WikiPageSummary,
} from "@/lib/types";

interface AdminTabsProps {
  pages: WikiPageSummary[];
  categories: CategoryWithCount[];
  users: AdminUserRow[] | null;
  redirects: RedirectRow[];
}

export default function AdminTabs({ pages, categories, users, redirects }: AdminTabsProps) {
  return (
    <Tabs defaultValue="pages">
      <TabsList>
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="redirects">Redirects</TabsTrigger>
        {users && <TabsTrigger value="users">Users</TabsTrigger>}
      </TabsList>

      <TabsContent value="pages" className="mt-6">
        <AdminPages pages={pages} />
      </TabsContent>

      <TabsContent value="categories" className="mt-6">
        <AdminCategories categories={categories} />
      </TabsContent>

      <TabsContent value="redirects" className="mt-6">
        <AdminRedirects redirects={redirects} />
      </TabsContent>

      {users && (
        <TabsContent value="users" className="mt-6">
          <AdminUsers users={users} />
        </TabsContent>
      )}
    </Tabs>
  );
}
