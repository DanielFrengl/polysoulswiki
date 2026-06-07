"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { diffWords } from "diff";
import { RotateCcw, GitCompare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn, formatDate } from "@/lib/utils";
import { getRevision, revertToRevision } from "@/app/wiki/revisions";
import type { RevisionSummary } from "@/lib/types";

interface RevisionHistoryProps {
  revisions: RevisionSummary[];
  editable: boolean;
}

/** Strip HTML tags so the diff compares readable text rather than markup. */
function toPlainText(html: string): string {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

export default function RevisionHistory({
  revisions,
  editable,
}: RevisionHistoryProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffParts, setDiffParts] = useState<
    { value: string; added?: boolean; removed?: boolean }[]
  >([]);
  const [pendingDiff, startDiff] = useTransition();
  const [pendingRevert, startRevert] = useTransition();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length === 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const runDiff = () => {
    if (selected.length !== 2) return;
    startDiff(async () => {
      const [a, b] = await Promise.all([
        getRevision(selected[0]),
        getRevision(selected[1]),
      ]);
      if (!a || !b) {
        toast.error("Could not load one of the revisions.");
        return;
      }
      // Order oldest -> newest for a readable diff.
      const [older, newer] =
        a.createdAt <= b.createdAt ? [a, b] : [b, a];
      setDiffParts(diffWords(toPlainText(older.content), toPlainText(newer.content)));
      setDiffOpen(true);
    });
  };

  const handleRevert = (id: string) => {
    startRevert(async () => {
      const result = await revertToRevision(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Reverted. A new revision was created.");
      router.push(`/wiki/${result.data.slug}`);
      router.refresh();
    });
  };

  if (revisions.length === 0) {
    return (
      <p className="text-muted-foreground">No revisions recorded yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Select two revisions to compare ({selected.length}/2 selected).
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={selected.length !== 2 || pendingDiff}
          onClick={runDiff}
        >
          {pendingDiff ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GitCompare className="size-4" />
          )}
          Compare
        </Button>
      </div>

      <ol className="flex flex-col gap-3">
        {revisions.map((rev, index) => {
          const isSelected = selected.includes(rev.id);
          return (
            <li key={rev.id}>
              <Card className={cn(isSelected && "border-primary ring-1 ring-primary")}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-primary"
                      checked={isSelected}
                      onChange={() => toggleSelect(rev.id)}
                      aria-label={`Select revision from ${formatDate(rev.createdAt)}`}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{rev.title}</span>
                        {index === 0 && <Badge variant="secondary">current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rev.editor ? (
                          rev.editor.username ? (
                            <Link
                              href={`/wiki/user/${rev.editor.username}`}
                              className="hover:underline"
                            >
                              {rev.editor.name}
                            </Link>
                          ) : (
                            rev.editor.name
                          )
                        ) : (
                          "Unknown"
                        )}{" "}
                        · {formatDate(rev.createdAt)}
                      </p>
                      {rev.comment && (
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          “{rev.comment}”
                        </p>
                      )}
                    </div>
                  </div>

                  {editable && index !== 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={pendingRevert}>
                          <RotateCcw className="size-4" />
                          Revert
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revert to this revision?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This restores the page content from{" "}
                            {formatDate(rev.createdAt)} and records it as a new
                            revision. Nothing is lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRevert(rev.id)}>
                            Revert
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>

      <Dialog open={diffOpen} onOpenChange={setDiffOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle>Comparing revisions</DialogTitle>
            <DialogDescription>
              Removed text is struck through in red; added text is highlighted in
              green.
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {diffParts.map((part, i) => (
              <span
                key={i}
                className={cn(
                  part.added &&
                    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                  part.removed &&
                    "bg-destructive/20 text-destructive line-through",
                )}
              >
                {part.value}
              </span>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
