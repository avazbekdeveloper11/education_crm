const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Fetching centers...");
    const centers = await prisma.center.findMany();
    console.log("Centers found:", centers.length);
    centers.forEach(c => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, BotToken: "${c.botToken}"`);
    });
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
