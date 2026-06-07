"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { formatDate } from "@/lib/utils";
import { createRedirect, deleteRedirect } from "@/app/wiki/action";
import type { RedirectRow } from "@/lib/types";

interface AdminRedirectsProps {
  redirects: RedirectRow[];
}

export default function AdminRedirects({ redirects }: AdminRedirectsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [fromSlug, setFromSlug] = useState("");
  const [toPageSlug, setToPageSlug] = useState("");

  const resetForm = () => {
    setFromSlug("");
    setToPageSlug("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromSlug.trim()) {
      toast.error("From slug is required.");
      return;
    }
    if (!toPageSlug.trim()) {
      toast.error("Target page slug is required.");
      return;
    }
    startTransition(async () => {
      const result = await createRedirect({
        fromSlug: fromSlug.trim(),
        toPageSlug: toPageSlug.trim(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Redirect created.");
      resetForm();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteRedirect(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Redirect deleted.");
      router.refresh();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>New redirect</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="redir-from">From slug</Label>
              <Input
                id="redir-from"
                value={fromSlug}
                onChange={(e) => setFromSlug(e.target.value)}
                placeholder="old-page-name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="redir-to">Target page slug</Label>
              <Input
                id="redir-to"
                value={toPageSlug}
                onChange={(e) => setToPageSlug(e.target.value)}
                placeholder="new-page-name"
                required
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Create redirect
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        {redirects.length === 0 ? (
          <p className="text-muted-foreground">No redirects yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From slug</TableHead>
                <TableHead>Target page</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm">{row.fromSlug}</TableCell>
                  <TableCell>
                    {row.toPage.title}{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      /wiki/{row.toPage.slug}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete redirect?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The slug{" "}
                            <span className="font-mono">{row.fromSlug}</span>{" "}
                            will no longer redirect to “{row.toPage.title}”.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(row.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
