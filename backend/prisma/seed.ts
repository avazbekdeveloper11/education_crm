import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const center = await prisma.center.upsert({
    where: { login: 'demo' },
    update: {},
    create: {
      name: 'Demo O\'quv Markazi',
      login: 'demo',
      password: 'password123',
      status: 'Active',
    },
  });
  console.log('Center created:', center);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
