import { Bot, Keyboard, InlineKeyboard, Context, session } from "grammy";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

interface SessionData {
  step: "idle" | "awaiting_parent_phone" | "awaiting_parent_contact";
  studentId?: number;
}
type MyContext = Context & { session: SessionData };

function formatDateUz(date: Date) {
  return format(new Date(date), "d-MMMM, yyyy", { locale: uz });
}

dotenv.config();
console.log("Runtime DATABASE_URL:", process.env.DATABASE_URL);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!
    }
  }
});

class BotManager {
  private bots: Map<number, Bot<MyContext>> = new Map();

  async startAll() {
    console.log("BotManager: Markazlarni qidirish boshlandi...");
    try {
      const centers = await prisma.center.findMany({
        where: { botToken: { not: null, notIn: ["", "none", "token"] } }
      });
      console.log(`BotManager: ${centers.length} ta faol bot topildi.`);
      for (const center of centers) {
        if (center.botToken) await this.startBot(center.id, center.name, center.botToken);
      }
    } catch (err: any) { console.error("Startup error:", err.message); }
    setInterval(() => this.checkNewBots(), 60000);
  }

  async startBot(centerId: number, centerName: string, token: string) {
    if (this.bots.has(centerId)) return;
    console.log(`[${centerName}] boti ishga tushirilmoqda...`);
    try {
      const bot = new Bot<MyContext>(token);
      bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

      async function showMonthAttendance(ctx: MyContext, year: number, month: number, telegramId: string) {
        const student = await (prisma.student as any).findFirst({
          where: { OR: [{ telegramId: telegramId }, { parentTelegramId: telegramId }] },
          include: { 
            attendance: {
              where: { date: { gte: new Date(year, month, 1), lt: new Date(year, month + 1, 1) } },
              orderBy: { date: 'desc' },
              include: { group: true }
            }
          }
        });
        if (!student) return;
        const mLabel = format(new Date(year, month, 1), "MMMM", { locale: uz });
        if (student.attendance.length === 0) {
          await ctx.reply(`<b>${mLabel}</b> uchun davomat topilmadi.`, { parse_mode: "HTML" });
        } else {
          let msg = "📊 <b>" + mLabel.toUpperCase() + " DAVOMATI</b>\n\n";
          student.attendance.forEach((a: any) => {
            msg += (a.status.toUpperCase()==='PRESENT'?'✅':'❌') + " <b>" + formatDateUz(a.date) + "</b>\n📖 " + a.group.name + "\n___________________\n\n";
          });
          await ctx.reply(msg, { parse_mode: "HTML" });
        }
      }

      bot.command("start", async (ctx) => {
        const payload = ctx.match;
        if (payload && payload.startsWith("parent_")) {
          const studentId = parseInt(payload.split("_")[1]!);
          const student = await (prisma.student as any).findUnique({ where: { id: studentId } });
          if (student) {
            ctx.session.step = "awaiting_parent_contact";
            ctx.session.studentId = studentId;
            return ctx.reply("Assalomu alaykum! Siz <b>" + student.name + "</b>ning ota-onasi sifatida ro'yxatdan o'tmoqchisiz.\n\nTasdiqlash uchun pastdagi tugma orqali telefon raqamingizni yuboring:", {
              parse_mode: "HTML",
              reply_markup: new Keyboard().requestContact("📲 Raqamni tasdiqlash").resized().oneTime()
            });
          }
        }
        ctx.session.step = "idle";
        try {
          await ctx.reply("Assalomu alaykum! <b>" + centerName + "</b> botiga xush kelibsiz.\n\nBotdan foydalanish uchun telefon raqamingizni yuboring.", {
            parse_mode: "HTML",
            reply_markup: new Keyboard().requestContact("📲 Raqamni yuborish").resized().oneTime()
          });
        } catch (e) {
          console.error("Start xabarini yuborishda xato:", e);
        }
      });

      bot.on("message:contact", async (ctx) => {
        const phone = ctx.message.contact.phone_number.replace("+", "");

        if (ctx.session.step === "awaiting_parent_contact" && ctx.session.studentId) {
          const student = await (prisma.student as any).findUnique({ where: { id: ctx.session.studentId } });
          if (!student) return;

          const expectedPhone = student.parentPhone ? student.parentPhone.replace("+", "") : "";
          if (phone === expectedPhone || phone.endsWith(expectedPhone) || expectedPhone.endsWith(phone)) {
            await (prisma.student as any).update({
              where: { id: student.id },
              data: { parentTelegramId: ctx.from!.id.toString() }
            });
            await ctx.reply("✅ Tasdiqlandi! Siz <b>" + student.name + "</b>ning ota-onasi sifatida bog'landingiz. 👨‍👩‍👧‍👦", {
              parse_mode: "HTML",
              reply_markup: new Keyboard()
                .text("💰 To'lovlar").text("📅 Davomat").row()
                .text("📚 Kurslarim").text("ℹ️ Ma'lumotlarim")
                .resized()
            });
            if (student.telegramId) {
              try {
                await bot.api.sendMessage(student.telegramId, "🎉 <b>Xushxabar!</b> Ota-onangiz botni aktivlashtirdi. Endi botdan to'liq foydalanishingiz mumkin!", {
                  parse_mode: "HTML",
                  reply_markup: new Keyboard()
                    .text("💰 To'lovlar").text("📅 Davomat").row()
                    .text("📚 Kurslarim").text("ℹ️ Ma'lumotlarim")
                    .resized()
                });
              } catch (e) {
                console.log("Talabaga xabar yuborib bo'lmadi:", student.telegramId);
              }
            }
            ctx.session.step = "idle";
          } else {
            await ctx.reply("❌ Xatolik! Yuborilgan raqam o'quvchi tomonidan qoldirilgan ota-ona raqamiga mos kelmadi. Iltimos, o'quvchi kiritgan raqamdan foydalaning.");
          }
          return;
        }

        const student = await (prisma.student as any).findFirst({ where: { phone: phone, centerId: centerId } });
        if (!student) return ctx.reply("Kechirasiz, bu raqam tizimda topilmadi. 🧐");

        await (prisma.student as any).update({ where: { id: student.id }, data: { telegramId: ctx.from!.id.toString() } });
        
        // Agar ota-ona allaqachon bog'langan bo'lsa, uning bloklanmaganini tekshiramiz
        if (student.parentTelegramId) {
          try {
            // Ota-ona botni bloklamaganini tekshirish (typing yuborib ko'ramiz)
            await bot.api.sendChatAction(student.parentTelegramId, "typing");
            
            ctx.session.step = "idle";
            return ctx.reply("✅ Hush kelibsiz! Raqamingiz va ota-onangiz hisobi allaqachon tasdiqlangan.", {
              reply_markup: new Keyboard()
                .text("💰 To'lovlar").text("📅 Davomat").row()
                .text("📚 Kurslarim").text("ℹ️ Ma'lumotlarim")
                .resized()
            });
          } catch (err: any) {
            console.log("Ota-ona botni bloklagan yoki ID noto'g'ri:", err.message);
            // Agar bloklangan bo'lsa, davom etamiz (yangi raqam so'raymiz)
          }
        }

        ctx.session.step = "awaiting_parent_phone";
        ctx.session.studentId = student.id;

        try {
          await ctx.reply("✅ Raqamingiz tasdiqlandi!\n\nEndi botni aktivlashtirish uchun <b>ota-onangizning telefon raqamini</b> yozib yuboring (masalan: 998901234567):", { parse_mode: "HTML" });
        } catch (e) {
          console.error("Kontakt tasdiqlash xabarida xato:", e);
        }
      });

      bot.on("message:text", async (ctx) => {
        if (ctx.session.step === "awaiting_parent_phone" && ctx.session.studentId) {
          const pPhone = ctx.message.text.replace("+", "").trim();
          if (pPhone.length < 9) return ctx.reply("Iltimos, raqamni to'liq formatda yozing.");

          await (prisma.student as any).update({
            where: { id: ctx.session.studentId },
            data: { parentPhone: pPhone }
          });

          const me = await bot.api.getMe();
          const link = "https://t.me/" + me.username + "?start=parent_" + ctx.session.studentId;
          
          await ctx.reply("✅ Ota-onangiz raqami saqlandi!\n\n⚠️ <b>DIQQAT:</b> Endi ushbu havolani ota-onangizga yuboring. Ular botga kirib /start bosishlari shart:\n\n" + link, { parse_mode: "HTML" });
          ctx.session.step = "idle";
          return;
        }

        const text = ctx.message.text;
        const student = await (prisma.student as any).findFirst({
          where: { OR: [{ telegramId: ctx.from?.id.toString() }, { parentTelegramId: ctx.from?.id.toString() }] },
          include: { 
            courses: true,
            payments: { orderBy: { paymentDate: 'desc' }, include: { course: true } }
          }
        });
        if (!student) return;
        if (!student.parentTelegramId) {
          const me = await bot.api.getMe();
          const link = "https://t.me/" + me.username + "?start=parent_" + student.id;
          return ctx.reply("⚠️ Bot hali aktiv emas. Ota-onangiz ushbu linkni bosishi shart:\n\n" + link);
        }

        const kb = new Keyboard()
          .text("💰 To'lovlar").text("📅 Davomat").row()
          .text("📚 Kurslarim").text("ℹ️ Ma'lumotlarim")
          .resized();

        if (text === "💰 To'lovlar") {
          if (!student.payments.length) return ctx.reply("Sizda hali to'lovlar mavjud emas. 💳");
          
          let msg = "💳 <b>SIZNING TO'LOVLARINGIZ</b>\n\n";
          
          // Har bir kurs uchun oxirgi to'lovni topish
          student.courses.forEach((course: any) => {
            const lastPayment = student.payments.find((p: any) => p.courseId === course.id);
            msg += "📚 <b>" + course.name + "</b>\n";
            if (lastPayment) {
              msg += "💰 Summa: <b>" + lastPayment.amount.toLocaleString() + "</b> so'm\n";
              msg += "📅 Sana: " + formatDateUz(lastPayment.paymentDate);
              if (lastPayment.paidUntil) {
                msg += "\n✅ To'langan: <b>" + formatDateUz(lastPayment.paidUntil) + "</b> gacha";
              }
            } else {
              msg += "❌ Ushbu kurs uchun to'lov topilmadi.";
            }
            msg += "\n___________________\n\n";
          });

          await ctx.reply(msg, { parse_mode: "HTML", reply_markup: kb });
        } else if (text === "📅 Davomat") {
          const startDate = new Date(student.createdAt);
          const endDate = new Date();
          const months: any[] = [];
          const tempDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
          while (tempDate <= endDate) {
            months.push({ label: format(tempDate, "MMMM", { locale: uz }), year: tempDate.getFullYear(), month: tempDate.getMonth() });
            tempDate.setMonth(tempDate.getMonth() + 1);
          }

          if (months.length === 1) {
            const m = months[0];
            await showMonthAttendance(ctx, m.year, m.month, ctx.from!.id.toString());
          } else {
            const ikb = new InlineKeyboard();
            months.forEach((m, i) => { ikb.text(m.label, "attn_" + m.year + "_" + m.month); if((i+1)%3===0) ikb.row(); });
            await ctx.reply("Qaysi oy uchun davomatni ko'rmoqchisiz?", { reply_markup: ikb });
          }
        } else if (text === "📚 Kurslarim") {
          if (!student.courses.length) return ctx.reply("Siz hali hech qanday kursga a'zo emassiz. 📚");
          
          let msg = "📚 <b>SIZNING KURSLARINGIZ</b>\n\n";
          student.courses.forEach((c: any, i: number) => {
            msg += (i + 1) + ". <b>" + c.name + "</b>\n";
            msg += "💰 Narxi: " + c.price.toLocaleString() + " so'm\n";
            msg += "⌛️ Davomiyligi: " + c.duration + " oy\n";
            msg += "___________________\n\n";
          });
          await ctx.reply(msg, { parse_mode: "HTML", reply_markup: kb });
        } else if (text === "ℹ️ Ma'lumotlarim") {
          await ctx.reply("👤 <b>PROFIL</b>\n\nTalaba: " + student.name + "\nMarkaz: " + centerName + "\nOta-ona tel: " + (student.parentPhone || "Kiritilmagan"), { parse_mode: "HTML", reply_markup: kb });
        }
      });

      bot.on("callback_query:data", async (ctx) => {
        if (!ctx.callbackQuery.data.startsWith("attn_")) return;
        const p = ctx.callbackQuery.data.split("_");
        await showMonthAttendance(ctx, parseInt(p[1]!), parseInt(p[2]!), ctx.from.id.toString());
        await ctx.answerCallbackQuery();
      });

      bot.catch((err) => {
        console.error(`Error in bot ${centerName}:`, err.message);
      });

      bot.start({ onStart: (i) => console.log("@" + i.username + " OK") });
      this.bots.set(centerId, bot);
    } catch (e: any) { console.error(e.message); }
  }

  async checkNewBots() {
    const centers = await prisma.center.findMany({
      where: { botToken: { not: null }, id: { notIn: Array.from(this.bots.keys()) } }
    });
    for (const c of centers) if(c.botToken) await this.startBot(c.id, c.name, c.botToken);
  }
}

new BotManager().startAll();
