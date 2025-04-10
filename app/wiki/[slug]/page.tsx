import { checkUserLoggedIn, supabase } from "@/app/utils/supabase/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "path";
import { formatDateTime } from "@/lib/utils";

export default async function WikiPage({
  params, // This is already provided by Next.js, no need for async/await here
}: {
  params: { slug: string };
}) {
  const { slug } = await params; // Simply destructure slug directly from params

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("Current user:", user);

  // Now, we can query the data from Supabase using the destructured slug
  const { data: page, error } = await supabase
    .from("wiki_pages")
    .select("*")
    .eq("slug", slug) // Use the destructured slug
    .single();

  if (error) {
    console.log(`Error fetching page data: ${error.message}`);
  }

  if (!page) {
    console.log("Page not found");
    return notFound();
  }

  const date = formatDateTime(page.created_at);

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
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
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
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
