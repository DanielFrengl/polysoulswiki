"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Moon,
  Sun,
  LayoutDashboard,
  FolderTree,
  Shield,
  User,
  LogOut,
  Activity,
  Eye,
  Menu,
  Gamepad2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "@/lib/auth-client";
import { STEAM_URL } from "@/lib/game";
import { cn } from "@/lib/utils";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavSearch from "@/components/nav/NavSearch";

const NAV_LINKS = [
  { href: "/wiki/dashboard", label: "Pages", icon: LayoutDashboard },
  { href: "/wiki/categories", label: "Categories", icon: FolderTree },
  { href: "/wiki/changes", label: "Recent changes", icon: Activity },
] as const;

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
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const user = session?.user as
    | { name: string; email: string; role?: string; username?: string | null }
    | undefined;
  const canEdit = user?.role === "editor" || user?.role === "admin";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 lg:px-8">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src="/logo/logo.png"
                  alt="PolySouls"
                  width={28}
                  height={28}
                  className="rounded"
                />
                PolySouls Wiki
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2">
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      isActive(link.href) && "bg-muted",
                    )}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
              {user && (
                <SheetClose asChild>
                  <Link
                    href="/wiki/watchlist"
                    className={cn(
                      "hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      isActive("/wiki/watchlist") && "bg-muted",
                    )}
                  >
                    <Eye className="size-4" />
                    Watchlist
                  </Link>
                </SheetClose>
              )}
              <SheetClose asChild>
                <a
                  href={STEAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                >
                  <Gamepad2 className="size-4" />
                  Play on Steam
                </a>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 font-semibold">
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
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(isActive(link.href) && "text-foreground bg-muted")}
            >
              <Link href={link.href}>
                <link.icon className="size-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavSearch />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden lg:inline-flex"
          >
            <a href={STEAM_URL} target="_blank" rel="noopener noreferrer">
              <Gamepad2 className="size-4" />
              Steam
            </a>
          </Button>

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
                <DropdownMenuItem asChild>
                  <Link href="/wiki/watchlist">
                    <Eye className="size-4" />
                    Watchlist
                  </Link>
                </DropdownMenuItem>
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
