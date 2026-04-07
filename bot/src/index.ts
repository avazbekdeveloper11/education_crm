import { Bot } from "grammy";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN is not defined in .env file");
}

const bot = new Bot(token);

// Handle the /start command.
bot.command("start", (ctx) => {
  ctx.reply("Assalomu alaykum! Education CRM botiga xush kelibsiz.\n\nSiz bu yerda kurslarga yozilish va o'quv jarayonini kuzatishingiz mumkin.");
});

// Handle other messages.
bot.on("message", (ctx) => {
  ctx.reply("Sizning xabaringiz qabul qilindi: " + ctx.message.text);
});

// Start the bot.
console.log("Bot ishga tushdi...");
bot.start();
