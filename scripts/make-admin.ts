// Promote a user to a role by email.
// Usage: npx tsx scripts/make-admin.ts user@example.com [admin|editor|reader]
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] ?? "admin";

  if (!email) {
    console.error("Usage: tsx scripts/make-admin.ts <email> [admin|editor|reader]");
    process.exit(1);
  }
  if (!["admin", "editor", "reader"].includes(role)) {
    console.error(`Invalid role: ${role}`);
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role },
  });
  console.log(`Set ${user.email} -> ${role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
