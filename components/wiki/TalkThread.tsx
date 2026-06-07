"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { postTalkMessage, deleteTalkMessage } from "@/app/wiki/talk";
import type { TalkMessageNode } from "@/lib/types";

interface TalkThreadProps {
  pageSlug: string;
  messages: TalkMessageNode[];
  signedIn: boolean;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DeleteButtonProps {
  id: string;
  onDeleted: () => void;
}

function DeleteButton({ id, onDeleted }: DeleteButtonProps) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTalkMessage(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Message deleted.");
      onDeleted();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={pending} className="h-7 px-2 text-muted-foreground hover:text-destructive">
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Trash2 className="size-3" />
          )}
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this message?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the message and any replies. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface AuthorLinkProps {
  author: { id: string; name: string; username: string | null } | null;
}

function AuthorLink({ author }: AuthorLinkProps) {
  if (!author) return <span className="font-medium">Unknown</span>;
  if (author.username) {
    return (
      <Link
        href={`/wiki/user/${author.username}`}
        className="font-medium hover:underline"
      >
        {author.name}
      </Link>
    );
  }
  return <span className="font-medium">{author.name}</span>;
}

interface ReplyFormProps {
  pageSlug: string;
  parentId: string;
  onDone: () => void;
}

function ReplyForm({ pageSlug, parentId, onDone }: ReplyFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await postTalkMessage({ pageSlug, body, parentId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Reply posted.");
      setBody("");
      onDone();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply…"
        rows={3}
        disabled={pending}
        className="resize-none text-sm"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || !body.trim()}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Post reply
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={onDone}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface MessageCardProps {
  message: TalkMessageNode;
  pageSlug: string;
  signedIn: boolean;
  onMutated: () => void;
}

function MessageCard({ message, pageSlug, signedIn, onMutated }: MessageCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <AuthorLink author={message.author} />
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{formatDate(message.createdAt)}</span>
        <div className="ml-auto flex items-center gap-1">
          {message.canDelete && (
            <DeleteButton id={message.id} onDeleted={onMutated} />
          )}
        </div>
      </div>

      {/* Body */}
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>

      {/* Reply action */}
      {signedIn && !replyOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-7 px-2 text-xs text-muted-foreground"
          onClick={() => setReplyOpen(true)}
        >
          Reply
        </Button>
      )}
      {signedIn && replyOpen && (
        <ReplyForm
          pageSlug={pageSlug}
          parentId={message.id}
          onDone={() => setReplyOpen(false)}
        />
      )}

      {/* Replies */}
      {message.replies.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-l-2 pl-4 ml-2">
          {message.replies.map((reply) => (
            <div key={reply.id}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <AuthorLink author={reply.author} />
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{formatDate(reply.createdAt)}</span>
                {reply.canDelete && (
                  <div className="ml-auto">
                    <DeleteButton id={reply.id} onDeleted={onMutated} />
                  </div>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{reply.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level new-message form
// ---------------------------------------------------------------------------

interface NewMessageFormProps {
  pageSlug: string;
  onPosted: () => void;
}

function NewMessageForm({ pageSlug, onPosted }: NewMessageFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await postTalkMessage({ pageSlug, body });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Message posted.");
      setBody("");
      onPosted();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Start a new discussion…"
        rows={4}
        disabled={pending}
        className="resize-none"
      />
      <div>
        <Button type="submit" disabled={pending || !body.trim()}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Post message
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function TalkThread({
  pageSlug,
  messages,
  signedIn,
}: TalkThreadProps) {
  const router = useRouter();

  const handleMutated = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Compose area */}
      {signedIn ? (
        <NewMessageForm pageSlug={pageSlug} onPosted={handleMutated} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      <Separator />

      {/* Message list */}
      {messages.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No messages yet. Be the first to start the discussion.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {messages.map((msg) => (
            <li key={msg.id}>
              <MessageCard
                message={msg}
                pageSlug={pageSlug}
                signedIn={signedIn}
                onMutated={handleMutated}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
