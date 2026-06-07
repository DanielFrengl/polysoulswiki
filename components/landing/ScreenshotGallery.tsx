"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SCREENSHOTS } from "@/lib/game";

export default function ScreenshotGallery() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {SCREENSHOTS.map((shot, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="group bg-muted relative overflow-hidden rounded-lg border"
            style={{ aspectRatio: "16 / 9" }}
            aria-label={`Open ${shot.alt}`}
          >
            <Image
              src={shot.full}
              alt={shot.alt}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">

          <DialogTitle className="sr-only">Screenshot</DialogTitle>
          {active !== null && (
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <Image
                src={SCREENSHOTS[active].full}
                alt={SCREENSHOTS[active].alt}
                fill
                sizes="100vw"
                className="rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
