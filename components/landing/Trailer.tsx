"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { TRAILER } from "@/lib/game";

export default function Trailer() {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border bg-black shadow-xl"
      style={{ aspectRatio: "16 / 9" }}
    >
      {playing ? (
        <video
          className="size-full"
          src={TRAILER.mp4}
          poster={TRAILER.poster}
          controls
          autoPlay
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play the PolySouls trailer"
          className="group absolute inset-0 flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${TRAILER.poster})` }}
        >
          <span className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/25" />
          <span className="bg-primary text-primary-foreground relative flex size-16 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110 md:size-20">
            <Play className="size-7 translate-x-0.5 fill-current md:size-9" />
          </span>
        </button>
      )}
    </div>
  );
}
