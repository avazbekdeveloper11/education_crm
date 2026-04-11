import { Bot, Keyboard, InlineKeyboard, Context, session } from "grammy";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

interface SessionData {
  step: "idle" | "awaiting_parent_phone" | "awaiting_parent_contact" | "awaiting_absence_reason";
  studentId?: number;
}
type MyContext = Context & { session: SessionData };

function formatDateUz(date: Date) {
  return format(new Date(date), "d-MMMM, yyyy", { locale: uz });
}

// Global safety net
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Tutilmagan asenkron xato:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Kutilmagan kritik xato:', err.message);
});

dotenv.config();
console.log("🚀 LATEST BOT PRODUCTION READY v4");
const prisma = new PrismaClient();

class BotManager {
  private bots: Map<number, Bot<MyContext>> = new Map();

  async startAll() {
    console.log("⏳ DB dan faol markazlar olinmoqda...");
    try {
      const centers = await prisma.center.findMany({
        where: { 
          botToken: { not: null, notIn: ["", "none", "token"] },
          status: "Active" 
        }
      });

      console.log(`📊 Topilgan faol botlar: ${centers.length}`);

      for (const center of centers) {
        if (center.botToken) {
          await this.startBot(center.id, center.name, center.botToken);
        }
      }
    } catch (err: any) { 
      console.error("❌ Boshqaruvchida xato:", err.message);
    }
    // Har 5 daqiqada yangi botlarni tekshirib turish
    setInterval(() => this.checkNewBots(), 300000);
  }

  async startBot(centerId: number, centerName: string, token: string) {
    if (this.bots.has(centerId)) return;
    
    try {
      console.log(`[${centerName}] boti tekshirilmoqda...`);
      const bot = new Bot<MyContext>(token);

      // Tokenni tekshirish
      await bot.init();
      console.log(`✅ @${bot.botInfo.username} muvaffaqiyatli ishga tushdi (${centerName})`);

      bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

      // --- ASOSIY LOGIKA ---

      const mainKeyboard = new Keyboard()
        .text("💰 To'lovlar").text("📅 Davomat").row()
        .text("📚 Kurslarim").text("ℹ️ Ma'lumotlarim").row()
        .text("✍️ Kelolmaslik")
        .resized();

      // Show Month Attendance
      const showAttendance = async (ctx: MyContext, year: number, month: number, telegramId: string) => {
        const student = await prisma.student.findFirst({
          where: { 
            centerId: centerId,
            OR: [{ telegramId }, { parentTelegramId: telegramId }] 
          },
          include: { 
            attendance: {
              where: { date: { gte: new Date(year, month, 1), lt: new Date(year, month + 1, 1) } },
              orderBy: { date: 'desc' },
              include: { group: true }
            }
          }
        });

        if (!student) return ctx.reply("Ma'lumot topilmadi.");
        
        const mLabel = format(new Date(year, month, 1), "MMMM", { locale: uz });
        if (student.attendance.length === 0) {
          return ctx.reply(`<b>${mLabel}</b> uchun davomat topilmadi.`, { parse_mode: "HTML" });
        }

        let msg = `📊 <b>${mLabel.toUpperCase()} DAVOMATI</b>\n\n`;
        student.attendance.forEach((a: any) => {
          const statusEmoji = a.status === 'PRESENT' ? '✅' : (a.status === 'EXCUSED' ? '🟡' : '❌');
          const statusText = a.status === 'PRESENT' ? 'Keldi' : (a.status === 'EXCUSED' ? 'Sababli' : 'Kelmagan');
          msg += `${statusEmoji} <b>${formatDateUz(a.date)}</b> (${statusText})\n📖 ${a.group.name}\n___________________\n\n`;
        });
        await ctx.reply(msg, { parse_mode: "HTML" });
      };

      bot.command("start", async (ctx) => {
        const payload = ctx.match;
        if (payload && payload.startsWith("parent_")) {
          const studentId = parseInt(payload.split("_")[1]!);
          const student = await prisma.student.findFirst({ where: { id: studentId, centerId } });
          if (student) {
            ctx.session.step = "awaiting_parent_contact";
            ctx.session.studentId = studentId;
            return ctx.reply(`Assalomu alaykum! Siz <b>${student.name}</b>ning ota-onasi sifatida bog'lanmoqchisiz.\n\nTasdiqlash uchun telefon raqamingizni yuboring:`, {
              parse_mode: "HTML",
              reply_markup: new Keyboard().requestContact("📲 Raqamni tasdiqlash").resized().oneTime()
            });
          }
        }
        
        ctx.session.step = "idle";
        await ctx.reply(`Assalomu alaykum! <b>${centerName}</b> botiga xush kelibsiz.\n\nTizimdan foydalanish uchun telefon raqamingizni yuboring:`, {
          parse_mode: "HTML",
          reply_markup: new Keyboard().requestContact("📲 Raqamni yuborish").resized().oneTime()
        });
      });

      bot.on("message:contact", async (ctx) => {
        const contactPhone = ctx.message.contact.phone_number.replace("+", "");
        
        // Handle Parent Connection
        if (ctx.session.step === "awaiting_parent_contact" && ctx.session.studentId) {
          const student = await prisma.student.findFirst({ where: { id: ctx.session.studentId, centerId } });
          if (!student) return;

          const dbParentPhone = student.parentPhone?.replace("+", "") || "";
          if (contactPhone.endsWith(dbParentPhone) || dbParentPhone.endsWith(contactPhone)) {
            await prisma.student.update({
              where: { id: student.id },
              data: { parentTelegramId: ctx.from.id.toString() }
            });
            ctx.session.step = "idle";
            return ctx.reply(`✅ Muvaffaqiyatli bog'landingiz! Endi ${student.name}ning darslarini kuzatib borishingiz mumkin.`, { reply_markup: mainKeyboard });
          } else {
            return ctx.reply("❌ Xato raqam. Iltimos, markazda ro'yxatdan o'tgan raqamingizdan foydalaning.");
          }
        }

        // Handle Student Connection
        const searchPhone = contactPhone.length > 9 ? contactPhone.slice(-9) : contactPhone;
        const students = await prisma.student.findMany({ 
          where: { centerId, phone: { contains: searchPhone } } 
        });

        const activeStudent = students.find(s => {
          const sPhone = s.phone.replace(/\D/g, "");
          return sPhone.endsWith(contactPhone) || contactPhone.endsWith(sPhone);
        });

        if (!activeStudent) {
          return ctx.reply("Kechirasiz, bu raqam tizimda topilmadi. Admin bilan bog'laning.");
        }

        await prisma.student.update({
          where: { id: activeStudent.id },
          data: { telegramId: ctx.from.id.toString() }
        });

        ctx.session.studentId = activeStudent.id;
        ctx.session.step = "awaiting_parent_phone";
        await ctx.reply("✅ Raqamingiz tasdiqlandi. Endi ota-onangizning telefon raqamini yozing (masalan: 998901234567):");
      });

      bot.on("message:text", async (ctx) => {
        const text = ctx.message.text;
        const userId = ctx.from.id.toString();

        // Handle Parent Phone Input
        if (ctx.session.step === "awaiting_parent_phone" && ctx.session.studentId) {
          let pPhone = text.replace(/\D/g, "");
          if (pPhone.length === 9) pPhone = "998" + pPhone;
          if (pPhone.length !== 12) return ctx.reply("Raqamni to'liq formatda yozing (masalan: 998901234567)");

          await prisma.student.update({
            where: { id: ctx.session.studentId },
            data: { parentPhone: pPhone }
          });

          const me = await bot.api.getMe();
          const link = `https://t.me/${me.username}?start=parent_${ctx.session.studentId}`;
          ctx.session.step = "idle";
          return ctx.reply(`✅ Saqlandi. Endi ushbu havolani ota-onangizga yuboring:\n\n${link}`);
        }

        const student = await prisma.student.findFirst({
          where: { 
            centerId,
            status: "Active",
            OR: [{ telegramId: userId }, { parentTelegramId: userId }] 
          },
          include: { courses: true, payments: { orderBy: { paymentDate: 'desc' }, take: 5 } }
        });

        if (!student) {
          const isRegisteredButInactive = await prisma.student.findFirst({
            where: {
              centerId,
              status: { not: "Active" },
              OR: [{ telegramId: userId }, { parentTelegramId: userId }] 
            }
          });

          if (isRegisteredButInactive) {
            return ctx.reply("Sizning ushbu botdan foydalanish huquqingiz cheklangan (Arxiv yoki Bloklangan). Iltimos, ma'muriyat bilan bog'laning.");
          }

          if (ctx.session.step === "idle") {
            return ctx.reply("Siz hali tizimda ro'yxatdan o'tmagansiz yoki ota-ona sifatida bog'lanmagansiz.\n\nIltimos, ro'yxatdan o'tish uchun /start buyrug'ini bosing yoki farzandingiz yuborgan maxsus havoladan foydalaning.");
          }
          return;
        }

        // Check if student is accessing (not parent) and parent is not registered
        const isStudent = student.telegramId === userId;
        const parentNotRegistered = !student.parentTelegramId;

        // Menu items that require parent to be registered
        const parentRequiredMenus = ["💰 To'lovlar", "📅 Davomat", "📚 Kurslarim"];

        if (isStudent && parentNotRegistered && parentRequiredMenus.includes(text)) {
          const me = await bot.api.getMe();
          const link = `https://t.me/${me.username}?start=parent_${student.id}`;
          return ctx.reply(
            `⚠️ Ushbu bo'limni ko'rish uchun ota-onangiz avval tizimga ro'yxatdan o'tishi kerak.\n\nQuyidagi havolani ota-onangizga yuboring:\n🔗 ${link}\n\nOta-onangiz havolani bosib, telefon raqamini tasdiqlasa, siz ham to'liq imkoniyatlardan foydalana olasiz.`
          );
        }

        // Handle Absence Reason
        if (ctx.session.step === "awaiting_absence_reason") {
          if (text === "❌ Bekor qilish") {
            ctx.session.step = "idle";
            return ctx.reply("Bekor qilindi.", { reply_markup: mainKeyboard });
          }
          await (prisma as any).absenceRequest.create({
            data: { studentId: student.id, centerId, date: new Date(), reason: text }
          });
          ctx.session.step = "idle";
          return ctx.reply("✅ Sabab saqlandi. Muallim xabardor qilindi.", { reply_markup: mainKeyboard });
        }

        // --- MENU COMMANDS ---
        switch (text) {
          case "💰 To'lovlar":
            if (!student.payments.length) return ctx.reply("Hali to'lovlar yo'q.");
            let pMsg = "💳 <b>OXIRGI TO'LOVLAR:</b>\n\n";
            student.payments.forEach(p => {
              pMsg += `💵 ${p.amount.toLocaleString()} so'm\n📅 ${formatDateUz(p.paymentDate)}\n___________________\n\n`;
            });
            await ctx.reply(pMsg, { parse_mode: "HTML" });
            break;

          case "📅 Davomat":
            const now = new Date();
            await showAttendance(ctx, now.getFullYear(), now.getMonth(), userId);
            break;

          case "📚 Kurslarim":
            let cMsg = "📚 <b>KURSLARINGIZ:</b>\n\n";
            student.courses.forEach(c => {
              cMsg += `• ${c.name}\n`;
            });
            await ctx.reply(cMsg, { parse_mode: "HTML" });
            break;

          case "ℹ️ Ma'lumotlarim":
            await ctx.reply(`👤 <b>PROFIL</b>\n\nIsm: ${student.name}\nMarkaz: ${centerName}\nTel: ${student.phone}`, { parse_mode: "HTML" });
            break;

          case "✍️ Kelolmaslik":
            ctx.session.step = "awaiting_absence_reason";
            const cancelKb = new Keyboard().text("❌ Bekor qilish").resized();
            await ctx.reply("Darsga kelolmaslik sababini yozing:", { reply_markup: cancelKb });
            break;
        }
      });

      bot.catch((err) => console.error(`[${centerName}] loop error:`, err.message));

      // Botni asenkron ishga tushirish
      bot.start({ 
        onStart: (i) => console.log(`🚀 @${i.username} online`),
        drop_pending_updates: true 
      }).catch(err => {
        console.error(`❌ [${centerName}] start crash:`, err.message);
      });

      this.bots.set(centerId, bot);
    } catch (e: any) {
      console.error(`❌ [${centerName}] TOKEN XATOSI:`, e.name === "GrammyError" ? "Yaroqsiz token" : e.message);
    }
  }

  async checkNewBots() {
    const centers = await prisma.center.findMany({
      where: { 
        botToken: { not: null, notIn: ["", "none", "token"] },
        id: { notIn: Array.from(this.bots.keys()) } 
      }
    });
    for (const c of centers) if(c.botToken) await this.startBot(c.id, c.name, c.botToken);
  }
}

new BotManager().startAll();
