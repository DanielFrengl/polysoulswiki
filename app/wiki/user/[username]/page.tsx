import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicUser, listUserContributions } from "@/app/wiki/users";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getPublicUser(username);
  if (!user) return { title: "User not found — PolySouls Wiki" };
  return { title: `${user.name} — PolySouls Wiki` };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const user = await getPublicUser(username);
  if (!user) notFound();

  const contributions = await listUserContributions(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <Badge variant="secondary">{user.role}</Badge>
        </div>

        <p className="text-muted-foreground mt-1">@{user.username}</p>

        {user.bio && (
          <p className="mt-3 text-sm">{user.bio}</p>
        )}

        <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>Joined {formatDate(user.createdAt)}</span>
          <span>{user.contributionCount} contribution{user.contributionCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Contributions</h2>

      {contributions.length === 0 ? (
        <p className="text-muted-foreground">No contributions yet.</p>
      ) : (
        <ol className="flex flex-col divide-y">
          {contributions.map((contrib) => (
            <li key={contrib.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start gap-2">
                {contrib.isNewPage && (
                  <Badge variant="secondary" className="shrink-0">
                    new page
                  </Badge>
                )}
                <Link
                  href={`/wiki/${contrib.pageSlug}`}
                  className="font-medium hover:underline"
                >
                  {contrib.pageTitle}
                </Link>
              </div>

              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span>{formatDate(contrib.createdAt)}</span>

                {contrib.comment && (
                  <>
                    <span>·</span>
                    <span className="italic">“{contrib.comment}”</span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
