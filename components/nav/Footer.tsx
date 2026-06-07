import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { STEAM_URL, GAME } from "@/lib/game";

const sections: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Wiki",
      links: [
        { label: "Home", href: "/" },
        { label: "All pages", href: "/wiki/dashboard" },
        { label: "Categories", href: "/wiki/categories" },
        { label: "Recent changes", href: "/wiki/changes" },
      ],
    },
    {
      heading: "Community",
      links: [
        { label: "Watchlist", href: "/wiki/watchlist" },
        { label: "Create an account", href: "/register" },
        { label: "Sign in", href: "/login" },
      ],
    },
  ];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 mt-16 border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/logo/logo.png"
                alt="PolySouls"
                width={32}
                height={32}
                className="rounded"
              />
              <span>PolySouls Wiki</span>
            </Link>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm">
              The community guide and database for {GAME.name} — pages, lore,
              builds, and combat knowledge, written by players.
            </p>
            <a
              href={STEAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Play {GAME.name} on Steam
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-sm font-semibold">{section.heading}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-10 flex flex-col items-start justify-between gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center">
          <p>© {year} PolySouls Wiki. A community-run fan wiki.</p>
          <p>
            Game artwork &amp; trailer © their respective owners, via{" "}
            <a
              href={STEAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline-offset-2 hover:underline"
            >
              Steam
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
