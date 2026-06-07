"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { watchPage, unwatchPage } from "@/app/wiki/watch";

interface WatchButtonProps {
  pageSlug: string;
  initialWatching: boolean;
}

export default function WatchButton({ pageSlug, initialWatching }: WatchButtonProps) {
  const [watching, setWatching] = useState(initialWatching);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const res = watching
        ? await unwatchPage(pageSlug)
        : await watchPage(pageSlug);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      setWatching(res.data.watching);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : watching ? (
        <EyeOff className="size-4" />
      ) : (
        <Eye className="size-4" />
      )}
      {watching ? "Unwatch" : "Watch"}
    </Button>
  );
}
