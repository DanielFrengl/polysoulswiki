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

export default function ClientWikiPage({
  page,
  date,
}: {
  page: any;
  date: string;
}) {
  const { user } = useAuth();

  const handleDelete = async () => {
    try {
      await deletePage(page.slug);
    } catch (error) {
      toast.error("Failed to delete page");
    }

    toast.success("Page deleted successfully");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 prose dark:prose-invert">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>{page.title}</CardTitle>
            <CardTitle>{date}</CardTitle>
          </div>
          <Separator className="my-4" />
        </CardHeader>
        <CardContent>
          {page.content ? (
            <div
              className="prose dark:prose-invert prose-a:text-blue-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p>Content not available</p>
          )}
        </CardContent>

        {user && (
          <CardFooter>
            <Link
              href={`/wiki/edit/${page.slug}`}
              className="text-sm text-blue-500 hover:underline block mt-6"
            >
              Edit this page
            </Link>
            <Button onClick={handleDelete} variant={"destructive"}>
              Delete this page
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
