"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { deletePage } from "../action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

export default function ClientWikiPage({
  page,
  date,
}: {
  page: any;
  date: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }
    try {
      await deletePage(page.slug);
      toast.success("Page deleted successfully");
      await router.push("/wiki/dashboard");
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  return (
    <div className="w-full max-w-6xl px-4 py-6 sm:py-10 mx-auto prose dark:prose-invert">
      <div className="relative">
        <Card className="w-full mx-auto">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <CardTitle className="text-lg md:text-2xl font-bold break-words">
                {page.title}
              </CardTitle>
              <CardTitle className="text-xs md:text-base text-muted-foreground whitespace-nowrap">
                {date}
              </CardTitle>
            </div>
            <Separator className="my-4" />
          </CardHeader>
          <CardContent>
            {page.content ? (
              <div
                className="prose dark:prose-invert prose-a:text-blue-600 max-w-none prose-xs md:prose-base break-words"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p>Content not available</p>
            )}
          </CardContent>
        </Card>
        {user && (
          <div className="fixed top-[8rem] right-5 lg:top-1/4 lg:right-5 z-50 flex flex-col gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full shadow-md bg-background hover:opacity-100"
              asChild
            >
              <Link href={`/wiki/edit/${page.slug}`}>
                <Pencil className="h-4 w-4 md:h-5 md:w-5 opacity-100" />
              </Link>
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="rounded-full shadow-md hover:opacity-100"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5 opacity-100" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
