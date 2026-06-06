"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AuthLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Default to the light-on-dark logo until mounted to avoid hydration mismatch.
  const src = mounted && resolvedTheme === "light" ? "/logo/logoblack.png" : "/logo/logo.png";

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
