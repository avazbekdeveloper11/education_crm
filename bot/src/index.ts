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

dotenv.config();
console.log("Runtime DATABASE_URL:", process.env.DATABASE_URL);
const prisma = new PrismaClient();

class BotManager {
  private bots: Map<number, Bot<MyContext>> = new Map();

  async startAll() {
    console.log("🚀 BotManager startAll ishladi");
    console.log("⏳ DB dan markazlar olinmoqda...");
    try {
      const allCenters = await prisma.center.findMany();
      console.log("📦 Barcha markazlar (filtrsiz):", JSON.stringify(allCenters, null, 2));
      
      const centers = await prisma.center.findMany({
        where: { botToken: { not: null, notIn: ["", "none", "token"] } }
      });
      console.log(`📊 Faol botli markazlar soni: ${centers.length}`);
      
      if (centers.length === 0) {
        console.warn("⚠️ Diqqat: Birorta ham botToken'li faol markaz topilmadi!");
      }

      for (const center of centers) {
        if (center.botToken) await this.startBot(center.id, center.name, center.botToken);
      }
    } catch (err: any) { 
      console.error("❌ Startup error:", err.message);
      console.error("Stack:", err.stack);
    }
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
            const statusEmoji = a.status.toUpperCase() === 'PRESENT' ? '✅' : (a.status.toUpperCase() === 'EXCUSED' ? '🟡' : '❌');
            const statusText = a.status.toUpperCase() === 'PRESENT' ? 'Keldi' : (a.status.toUpperCase() === 'EXCUSED' ? 'Sababli' : 'Kelmagan');
            msg += statusEmoji + " <b>" + formatDateUz(a.date) + "</b> (" + statusText + ")\n📖 " + a.group.name + "\n___________________\n\n";
          });
          await ctx.reply(msg, { parse_mode: "HTML" });
        }
      }

      bot.command("start", async (ctx) => {
        const payload = ctx.match;
        if (payload && payload.startsWith("parent_")) {
          const studentId = parseInt(payload.split("_")[1]!);
          const student = await prisma.student.findUnique({ where: { id: studentId } });
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
            // Unique constraint xatosini oldini olish uchun
            await (prisma.student as any).updateMany({
              where: { parentTelegramId: ctx.from!.id.toString() },
              data: { parentTelegramId: null }
            });

            await prisma.student.update({
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

        const searchPhone = phone.length > 9 ? phone.slice(-9) : phone;

        const students = await (prisma.student as any).findMany({ 
          where: { 
            centerId: centerId,
            phone: { contains: searchPhone } 
          } 
        });

        const student = students.find((s: any) => {
          const dbPhone = s.phone.replace(/\D/g, "");
          return dbPhone === phone || dbPhone.endsWith(phone) || phone.endsWith(dbPhone);
        });

        if (!student) return ctx.reply("Kechirasiz, bu raqam tizimda topilmadi. 🧐\n\nIltimos, admin panelda raqamingiz to'g'ri kiritilganini tekshiring.");

        // Unique constraint xatosini oldini olish uchun, ushbu telegramId boshqa birovda bo'lsa uni tozalaymiz
        await (prisma.student as any).updateMany({
          where: { telegramId: ctx.from!.id.toString() },
          data: { telegramId: null }
        });

        await prisma.student.update({ 
          where: { id: student.id }, 
          data: { telegramId: ctx.from!.id.toString() } 
        });
        
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
          let pPhone = ctx.message.text.replace(/\D/g, "").trim();
          if (pPhone.length === 9) {
            pPhone = "998" + pPhone;
          }

          if (pPhone.length !== 12) {
            return ctx.reply("❌ Raqam noto'g'ri. Iltimos, 9 ta (masalan: 901234567) yoki 12 ta raqam (998901234567) ko'rinishida yozing.");
          }

          await prisma.student.update({
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
          .text("📚 Kurslarim").text("ℹ️ Ma'lumotlarim").row()
          .text("✍️ Kelolmaslik")
          .resized();

        if (ctx.session.step === "awaiting_absence_reason") {
          if (text === "❌ Bekor qilish") {
            ctx.session.step = "idle";
            return ctx.reply("Amal bekor qilindi.", { reply_markup: kb });
          }

          const today = new Date();
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(end.getDate() + 1);

          await (prisma as any).absenceRequest.create({
            data: {
              studentId: student.id,
              centerId: centerId,
              date: start,
              reason: text // Foydalanuvchi yozgan sabab
            }
          });

          ctx.session.step = "idle";
          return ctx.reply("✅ Bugungi dars uchun ogohlantirish saqlandi. Muallim davomat olayotganida ushbu sababni ko'radi. ✍️", { reply_markup: kb });
        }

        if (text === "💰 To'lovlar") {
          if (!student.payments.length) return ctx.reply("Sizda hali to'lovlar mavjud emas. 💳");
          
          let msg = "💳 <b>SIZNING TO'LOVLARINGIZ</b>\n\n";
          
          // Har bir kurs uchun oxirgi to'lovni topish
          student.courses.forEach((course: any) => {
            const lastPayment = student.payments.find((p: any) => p.courseId === course.id);
            msg += "📚 <b>" + course.name + "</b>\n";
            if (lastPayment) {
              msg += "💵 Oxirgi to'lov: <b>" + lastPayment.amount.toLocaleString() + "</b> so'm\n";
              msg += "📅 To'lov kuni: " + formatDateUz(lastPayment.paymentDate) + "\n";
              if (lastPayment.paidUntil) {
                msg += "⏳ <b>Amal qilish muddati:</b> <code>" + formatDateUz(lastPayment.paidUntil) + "</code> gacha ✅";
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
        } else if (text === "✍️ Kelolmaslik") {
          const today = new Date();
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(end.getDate() + 1);

          const existing = await prisma.absenceRequest.findFirst({
            where: { studentId: student.id, date: { gte: start, lt: end } }
          });

          if (existing) {
            return ctx.reply("Bugun uchun allaqachon darsda qatnasholmaslik haqida ogohlantirish yuborgansiz. ✔️");
          }

          ctx.session.step = "awaiting_absence_reason";
          const cancelKb = new Keyboard().text("❌ Bekor qilish").resized();
          await ctx.reply("Iltimos, darsga kelolmaslik sababini yozib qoldiring (masalan: Mazam yo'q edi):", { reply_markup: cancelKb });
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

      // Tokenni tekshirish
      await bot.init();
      
      bot.start({ onStart: (i) => console.log("@" + i.username + " OK") }).catch((err) => {
        console.error(`❌ [${centerName}] boti kutilmaganda to'xtadi:`, err.message);
      });
      this.bots.set(centerId, bot);
    } catch (e: any) { 
      console.error(`❌ [${centerName}] boti ishga tushmadi:`, e.message); 
    }
  }

  async checkNewBots() {
    const centers = await prisma.center.findMany({
      where: { botToken: { not: null }, id: { notIn: Array.from(this.bots.keys()) } }
    });
    for (const c of centers) if(c.botToken) await this.startBot(c.id, c.name, c.botToken);
  }
}

new BotManager().startAll();
