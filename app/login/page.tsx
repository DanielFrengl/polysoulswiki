import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import AuthLogo from "@/components/auth/AuthLogo";
import LoginForm from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Sign in — PolySouls Wiki",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/wiki/home");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <AuthLogo />
        <div className="w-full">
          <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
