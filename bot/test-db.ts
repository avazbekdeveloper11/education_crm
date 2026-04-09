import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function test() {
  console.log("Checking database...");
  try {
    const centers = await prisma.center.findMany();
    console.log("Centers found:", centers.length);
    centers.forEach(c => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, BotToken: ${c.botToken ? 'Set' : 'Not Set'}`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
