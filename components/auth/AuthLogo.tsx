"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

export default function AuthLogo() {
  const { resolvedTheme } = useTheme();

  // resolvedTheme is undefined on the server and on the first client render, so
  // both default to the light-on-dark logo — no hydration mismatch. next-themes
  // then resolves the theme and re-renders with the correct asset.
  const src = resolvedTheme === "light" ? "/logo/logoblack.png" : "/logo/logo.png";

  return (
    <Image
      src={src}
      alt="PolySouls"
      width={160}
      height={80}
      priority
      className="h-20 w-auto"
    />
  );
}
