"use client";

import { RegisterForm } from "@/components/register-form";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const { resolvedTheme } = useTheme();
  const [imgPath, setImgPath] = useState("/logo/logo.png");

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setImgPath("/logo/logo.png");
    } else {
      setImgPath("/logo/logoblack.png");
    }
  }, [resolvedTheme]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <img src={imgPath} className="h-20 w-auto" alt="Logo" />
        <RegisterForm />
      </div>
    </div>
  );
}
