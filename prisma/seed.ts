import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Starter categories
  const categories = [
    { name: "Gameplay", slug: "gameplay", description: "Core mechanics and systems." },
    { name: "Lore", slug: "lore", description: "Story, world, and characters of PolySouls." },
    { name: "Items", slug: "items", description: "Weapons, gear, and consumables." },
  ];

  for (const c of categories) {
    await prisma.wikiCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // Home page
  const home = await prisma.wikiPage.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      title: "Welcome to the PolySouls Wiki",
      slug: "home",
      summary: "The official community documentation for PolySouls.",
      content:
        "<h2>Welcome</h2><p>This is the official PolySouls wiki. Browse categories or search to get started. Editors and admins can create and edit pages.</p>",
    },
  });

  // Seed an initial revision for the home page if none exists
  const revCount = await prisma.pageRevision.count({ where: { pageId: home.id } });
  if (revCount === 0) {
    await prisma.pageRevision.create({
      data: {
        pageId: home.id,
        title: home.title,
        content: home.content,
        comment: "Initial version",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
