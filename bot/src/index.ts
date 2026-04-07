import { Bot, Keyboard } from "grammy";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

function formatDateUz(date: Date) {
  return format(new Date(date), "d-MMMM, yyyy", { locale: uz });
}

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

class BotManager {
  private bots: Map<number, Bot> = new Map();

  async startAll() {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("Markazlar ro'yxati bazadan olinmoqda...");
    try {
      const centers = await prisma.center.findMany({
        where: {
          botToken: { not: null, notIn: ["", "none", "token"] }
        }
      });
      console.log(`Topilgan botlar soni: ${centers.length}`);
      
      for (const center of centers) {
        if (center.botToken) {
          await this.startBot(center.id, center.name, center.botToken);
        }
      }
    } catch (err: any) {
      console.error("Bazadan o'qishda xatolik:", err.message);
      if (err.message.includes("does not exist")) {
        console.log("MASLAHAT: 'npx prisma generate' buyrug'ini bot papkasida qayta ishlating.");
      }
    }
    
    // Periodically check for new centers every 1 minute
    setInterval(() => this.checkNewBots(), 60000);
  }

  async startBot(centerId: number, centerName: string, token: string) {
    if (this.bots.has(centerId)) return;

    try {
      const bot = new Bot(token);

      bot.command("start", (ctx) => {
        const keyboard = new Keyboard()
          .requestContact("Telefon raqamni yuborish")
          .resized()
          .oneTime();

        ctx.reply(
          `Assalomu alaykum! ${centerName} botiga xush kelibsiz.\n\n` +
          `Siz ushbu o'quv markaz o'quvchisimisiz? Iltimos, pastdagi tugma orqali telefon raqamingizni yuboring va botdan to'liq foydalaning.`,
          { reply_markup: keyboard }
        );
      });

      // Handle phone contact sharing
      bot.on("message:contact", async (ctx) => {
        const phone = ctx.message.contact.phone_number.replace("+", "");
        const telegramId = ctx.from?.id.toString();

        console.log(`[${centerName}] Tekshirilmoqda: ${phone}`);

        try {
          // Normalize phone for DB matching (remove leading/trailing spaces or other chars if any)
          // We assume DB has clean 998... numbers without +
          const student = await prisma.student.findFirst({
            where: {
              centerId: centerId,
              OR: [
                { phone: phone },
                { phone: phone.startsWith("998") ? phone.slice(3) : phone }
              ]
            }
          });

          if (student) {
            await (prisma.student as any).update({
              where: { id: student.id },
              data: { telegramId: telegramId }
            });

            const mainMenu = new Keyboard()
              .text("💰 To'lovlar")
              .text("📅 Davomat")
              .row()
              .text("ℹ️ Ma'lumotlarim")
              .resized();

            await ctx.reply(
              `Tabriklaymiz, ${student.name}! ✅\n` +
              `Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Pastdagi menyu orqali darslaringizni kuzatishingiz mumkin.`,
              { reply_markup: mainMenu }
            );
          } else {
            await ctx.reply(
              "Kechirasiz, bu raqam bizning bazamizda topilmadi. ❌\n" +
              "Iltimos, o'quv markaz admini bilan bog'laning."
            );
          }
        } catch (err: any) {
          console.error("Verification error:", err.message);
          ctx.reply("Ro'yxatdan o'tishda texnik xatolik yuz berdi.");
        }
      });

      bot.on("message", async (ctx) => {
        const text = ctx.message.text;
        const telegramId = ctx.from?.id.toString();

        // Find the student by telegramId
        const student = await (prisma.student as any).findUnique({
          where: { telegramId: telegramId },
          include: { 
            payments: { orderBy: { paymentDate: 'desc' }, take: 1 },
            attendance: { orderBy: { date: 'desc' }, take: 5, include: { group: true } }
          }
        });

        if (!student) {
          return ctx.reply("Iltimos, avval ro'yxatdan o'tish uchun telefon raqamingizni yuboring.");
        }

        if (text === "💰 To'lovlar") {
          if (student.payments.length === 0) {
            return ctx.reply("Hozircha hech qanday to'lov ma'lumotlari topilmadi. 💸");
          }

          let msg = `💳 <b>OXIRGI TO'LOV MA'LUMOTI</b>\n`;
          msg += `___________________\n\n`;

          const p = student.payments[0];
          const date = formatDateUz(p.paymentDate);
          const until = (p.paidUntil || p.periodTo) ? formatDateUz(p.paidUntil || p.periodTo) : "Noma'lum";
          
          msg += `💰 To'lov: <b>${p.amount.toLocaleString()}</b> so'm\n`;
          msg += `📅 Sana: ${date}\n`;
          msg += `⌛️ Muddat: <b>${until} gacha</b>\n`;
          msg += `___________________\n\n`;
          
          await ctx.reply(msg, { parse_mode: "HTML" });
        } 
        else if (text === "📅 Davomat") {
          if (student.attendance.length === 0) {
            return ctx.reply("Sizning davomat tarixingiz hali mavjud emas. 📅");
          }

          let msg = `📊 <b>DAVOMAT KO'RSATKICHLARI</b>\n`;
          msg += `___________________\n\n`;

          student.attendance.forEach((a: any) => {
            const date = formatDateUz(a.date);
            const isPresent = a.status.toUpperCase() === 'PRESENT';
            const icon = isPresent ? "✅" : "❌";
            const statusText = isPresent ? "Darsda qatnashgan" : "Darsda qatnashmagan";

            msg += `${icon} <b>${date}</b>\n`;
            msg += `📖 Guruh: ${a.group.name}\n`;
            msg += `📉 Holat: <b>${statusText}</b>\n`;
            msg += `___________________\n\n`;
          });

          await ctx.reply(msg, { parse_mode: "HTML" });
        }
        else if (text === "ℹ️ Ma'lumotlarim") {
           await ctx.reply(
             `👤 <b>TALABA PROFILI</b>\n` +
             `___________________\n\n` +
             `▫️ <b>Ism:</b> ${student.name}\n` +
             `▫️ <b>Tel:</b> +${student.phone}\n` +
             `▫️ <b>Markaz:</b> ${centerName}\n\n` +
             `✅ <b>Hozirgi holat:</b> ${student.status === 'Active' ? 'Faol o\'quvchi' : 'Nofaol'}`,
             { parse_mode: "HTML" }
           );
        }
        else {
          ctx.reply("Iltimos, menyudagi tugmalardan foydalaning.");
        }
      });

      // Start the bot in long polling mode
      bot.start({
        onStart: (info) => console.log(`[${centerName}] boti ishga tushdi: @${info.username}`),
      }).catch(err => {
        console.error(`[${centerName}] botini ishga tushirishda xato:`, err.message);
      });

      this.bots.set(centerId, bot);
    } catch (err: any) {
      console.error(`[${centerName}] tokenni ishga tushirib bo'lmadi:`, err.message);
    }
  }

  async checkNewBots() {
    const centers = await prisma.center.findMany({
      where: {
        botToken: { not: null, notIn: ["", "none", "token"] },
        id: { notIn: Array.from(this.bots.keys()) }
      }
    });

    for (const center of centers) {
       if(center.botToken) {
           await this.startBot(center.id, center.name, center.botToken);
       }
    }
  }
}

const manager = new BotManager();
manager.startAll().catch(err => {
  console.error("BotManager startup error:", err);
});
