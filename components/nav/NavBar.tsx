"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, LayoutDashboard, FolderTree, Shield, User, LogOut, Activity } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavSearch from "@/components/nav/NavSearch";

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function NavBar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as
    | { name: string; email: string; role?: string; username?: string | null }
    | undefined;
  const canEdit = user?.role === "editor" || user?.role === "admin";

  const handleSignOut = async () => {
    await signOut();
    router.push("/wiki/home");
    router.refresh();
  };

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 lg:px-8">
        <Link href="/wiki/home" className="flex items-center gap-2 font-semibold">
          <Image
            src="/logo/logo.png"
            alt="PolySouls"
            width={32}
            height={32}
            className="rounded"
            priority
          />
          <span className="hidden sm:inline">PolySouls Wiki</span>
        </Link>

        <nav className="text-muted-foreground ml-2 hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/wiki/dashboard">
              <LayoutDashboard className="size-4" />
              Pages
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/wiki/categories">
              <FolderTree className="size-4" />
              Categories
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/wiki/changes">
              <Activity className="size-4" />
              Recent changes
            </Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavSearch />
          <ThemeToggle />

          {isPending ? (
            <Skeleton className="size-9 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account menu"
                >
                  <Avatar className="size-8">
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.username && (
                  <DropdownMenuItem asChild>
                    <Link href={`/wiki/user/${user.username}`}>
                      <Activity className="size-4" />
                      My contributions
                    </Link>
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem asChild>
                    <Link href="/wiki/admin">
                      <Shield className="size-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
