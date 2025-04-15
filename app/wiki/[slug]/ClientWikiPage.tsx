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
    try {
      await deletePage(page.slug);
      toast.success("Page deleted successfully");
      await router.push("/wiki/dashboard");
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  return (
    <div className="w-[90vw] mx-auto py-10 prose dark:prose-invert">
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
            <div className="flex flex-row gap-2">
              <Button variant={"outline"}>
                <Link href={`/wiki/edit/${page.slug}`} className="no-underline">
                  Edit this page
                </Link>
              </Button>
              <Button onClick={handleDelete} variant={"destructive"}>
                Delete this page
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
