import Link from "next/link";
import { History } from "lucide-react";
import { getCurrentUser } from "@/lib/permissions";
import { listWatchlist } from "@/app/wiki/watch";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Watchlist — PolySouls Wiki",
};

export default async function WatchlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            <Link href="/login" className="underline hover:no-underline">
              Sign in
            </Link>{" "}
            to view and manage your watchlist.
          </p>
        </div>
      </div>
    );
  }

  const changes = await listWatchlist();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground mt-1">
          Recent changes to pages you watch.
        </p>
      </div>

      {changes.length === 0 ? (
        <p className="text-muted-foreground">
          You aren&apos;t watching any pages yet, or they have no changes. Use
          the <span className="font-medium">Watch</span> button on any page to
          add it to your watchlist.
        </p>
      ) : (
        <ol className="flex flex-col divide-y">
          {changes.map((change) => (
            <li key={change.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start gap-2">
                {change.isNewPage && (
                  <Badge variant="secondary" className="shrink-0">
                    new page
                  </Badge>
                )}
                <Link
                  href={`/wiki/${change.pageSlug}`}
                  className="font-medium hover:underline"
                >
                  {change.pageTitle}
                </Link>
              </div>

              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                {change.editor ? (
                  change.editor.username ? (
                    <Link
                      href={`/wiki/user/${change.editor.username}`}
                      className="hover:underline"
                    >
                      {change.editor.name}
                    </Link>
                  ) : (
                    <span>{change.editor.name}</span>
                  )
                ) : (
                  <span>Unknown editor</span>
                )}

                <span>·</span>
                <span>{formatDate(change.createdAt)}</span>

                {change.comment && (
                  <>
                    <span>·</span>
                    <span className="italic">&quot;{change.comment}&quot;</span>
                  </>
                )}

                <span>·</span>
                <Link
                  href={`/wiki/${change.pageSlug}/history`}
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <History className="size-3" />
                  history
                </Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
