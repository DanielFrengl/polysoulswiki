import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  FolderTree,
  Activity,
  ExternalLink,
} from "lucide-react";
import { listPages } from "@/app/wiki/action";
import { GAME, STEAM_URL, HERO_IMAGE } from "@/lib/game";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Trailer from "@/components/landing/Trailer";
import ScreenshotGallery from "@/components/landing/ScreenshotGallery";

export const metadata: Metadata = {
  title: "PolySouls Wiki — the community guide & database",
  description: GAME.tagline,
};

// The "Fresh from the wiki" section reads live pages from the DB, so render at
// request time rather than prerendering at build (which has no DB).
export const dynamic = "force-dynamic";

const quickLinks = [
  {
    href: "/wiki/dashboard",
    title: "All pages",
    description: "Browse every page in the wiki.",
    icon: FileText,
  },
  {
    href: "/wiki/categories",
    title: "Categories",
    description: "Lore, combat, items, world and more.",
    icon: FolderTree,
  },
  {
    href: "/wiki/changes",
    title: "Recent changes",
    description: "See what the community edited lately.",
    icon: Activity,
  },
];

export default async function LandingPage() {
  const pages = await listPages();
  const featured = pages.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="from-background via-background/80 to-background/40 absolute inset-0 bg-gradient-to-t" />
        <div className="from-background/90 absolute inset-0 bg-gradient-to-r to-transparent" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-24 lg:px-8 lg:py-32">
          <span className="border-border/60 bg-background/60 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
            <BookOpen className="size-3.5" />
            Community wiki
          </span>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-balance sm:text-6xl">
            The {GAME.name} Wiki
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-pretty">
            {GAME.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/wiki/home">
                <BookOpen className="size-4" />
                Browse the wiki
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={STEAM_URL} target="_blank" rel="noopener noreferrer">
                Play on Steam
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Card
              key={link.href}
              className="hover:border-foreground/20 group relative transition-colors"
            >
              <CardContent className="flex items-start gap-4">
                <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <link.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <Link
                    href={link.href}
                    className="font-semibold after:absolute after:inset-0"
                  >
                    {link.title}
                  </Link>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {link.description}
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trailer */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Watch the trailer</h2>
          <p className="text-muted-foreground mt-2">
            Get a feel for {GAME.name}&apos;s deliberate, deadly combat.
          </p>
        </div>
        <Trailer />
      </section>

      {/* Featured pages */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Fresh from the wiki
              </h2>
              <p className="text-muted-foreground mt-2">
                Recently updated pages from the community.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link href="/wiki/dashboard">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((page) => (
              <Card
                key={page.id}
                className="hover:border-foreground/20 group relative transition-colors"
              >
                <CardContent>
                  <Link
                    href={`/wiki/${page.slug}`}
                    className="font-semibold after:absolute after:inset-0 group-hover:underline"
                  >
                    {page.title}
                  </Link>
                  {page.summary && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {page.summary}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-3 text-xs">
                    Updated {formatDate(page.updatedAt)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Screenshots */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Screenshots</h2>
          <p className="text-muted-foreground mt-2">
            Scenes from the world of {GAME.name}. Click to enlarge.
          </p>
        </div>
        <ScreenshotGallery />
      </section>

      {/* About */}
      <section className="mx-auto w-full max-w-4xl px-4 py-12 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">About the game</h2>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">
          {GAME.about}
        </p>
      </section>

      {/* CTA band */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16 lg:px-8">
        <div className="bg-muted/40 flex flex-col items-center gap-4 rounded-2xl border px-6 py-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Know something we don&apos;t?
          </h2>
          <p className="text-muted-foreground max-w-md">
            This wiki is written by players. Create an account and help document
            the world of {GAME.name}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Start contributing</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/wiki/home">
                Read the wiki
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
