import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [, , email, role] = process.argv;

  if (!email || !role) {
    console.error("Uso: npx ts-node prisma/promote.ts usuario@ejemplo.com admin|support");
    process.exit(1);
  }

  if (role !== "admin" && role !== "support") {
    console.error('El rol debe ser "admin" o "support"');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role },
  });

  console.log(`Usuario ${user.email} promovido a ${user.role}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
