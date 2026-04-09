const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("Fetching students...");
    const students = await prisma.student.findMany({
      include: { courses: true, groups: true }
    });
    console.log("Students found:", students.length);

    console.log("Fetching groups...");
    const groups = await prisma.group.findMany({
      include: { _count: { select: { students: true } } }
    });
    console.log("Groups found:", groups.length);
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
