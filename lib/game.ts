// Game metadata + media for the PolySouls Wiki landing page.
// Assets are hotlinked from Steam's public CDN (see next.config remotePatterns).
// Source: https://store.steampowered.com/app/3604950/PolySouls/

export const STEAM_APP_ID = 3604950;
export const STEAM_URL = `https://store.steampowered.com/app/${STEAM_APP_ID}/PolySouls/`;

export const GAME = {
  name: "PolySouls",
  tagline:
    "An open-world action RPG with deep, skill-based combat. Every enemy is deadly, every fight a test of patience and precision.",
  about:
    "A soulslike-inspired action RPG built around skillful combat, deliberate movement, and environmental awareness. Explore an expansive open world full of secrets, craft your own build, and learn enemies whose every attack can end you. A minimalist art style keeps the focus where it belongs: on the fight.",
} as const;

const CDN =
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3604950";
const T = "?t=1744555892";

export const HEADER_IMAGE = `${CDN}/d0852c77f9bdaad535e1a2153cb4723d9ce483a5/header.jpg${T}`;

export interface Screenshot {
  full: string;
  alt: string;
}

export const SCREENSHOTS: Screenshot[] = [
  {
    full: `${CDN}/6567e7f35bac4e067264319b9cbafd74d1904ee3/ss_6567e7f35bac4e067264319b9cbafd74d1904ee3.1920x1080.jpg${T}`,
    alt: "PolySouls gameplay screenshot 1",
  },
  {
    full: `${CDN}/f7872340e28e9ad98555f38914b697055831051d/ss_f7872340e28e9ad98555f38914b697055831051d.1920x1080.jpg${T}`,
    alt: "PolySouls gameplay screenshot 2",
  },
  {
    full: `${CDN}/a32e9783941247e016bbacdd110e4788e30ef2a4/ss_a32e9783941247e016bbacdd110e4788e30ef2a4.1920x1080.jpg${T}`,
    alt: "PolySouls gameplay screenshot 3",
  },
  {
    full: `${CDN}/4211bc5520833f4b2680a4068f93d464710e893e/ss_4211bc5520833f4b2680a4068f93d464710e893e.1920x1080.jpg${T}`,
    alt: "PolySouls gameplay screenshot 4",
  },
  {
    full: `${CDN}/dc5127b28ab788d071afffb12900810684708d89/ss_dc5127b28ab788d071afffb12900810684708d89.1920x1080.jpg${T}`,
    alt: "PolySouls gameplay screenshot 5",
  },
];

// The hero/background still (first screenshot) and the trailer.
export const HERO_IMAGE = SCREENSHOTS[0].full;

export const TRAILER = {
  // Steam serves the trailer as plain MP4 from its video CDN.
  mp4: "https://video.akamai.steamstatic.com/store_trailers/257124495/movie_max.mp4",
  mp4_480:
    "https://video.akamai.steamstatic.com/store_trailers/257124495/movie480.mp4",
  poster:
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/257124495/afbae6001d630c495b427af239d5b8934ce46cef/movie_600x337.jpg?t=1744552822",
} as const;
