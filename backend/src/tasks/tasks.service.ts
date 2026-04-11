import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  // Har kuni soat 09:17 da ishlaydi
  @Cron('0 17 9 * * *')
  async handlePaymentReminders() {
    this.logger.debug('To\'lov ogohlantirishlarini tekshirish boshlandi...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Faqat bot tokeni bor markazlarni olamiz
    // @ts-ignore
    const centers = await this.prisma.center.findMany({
      where: { botToken: { not: null, notIn: ["", "none", "token"] } }
    });

    for (const center of centers) {
      if (!center.botToken) continue;

      // Faol talabalarni olamiz
      // @ts-ignore
      const students = await this.prisma.student.findMany({
        where: { 
          centerId: center.id,
          status: 'Active',
        },
        include: {
          courses: true
        }
      });

      for (const student of students) {
        for (const course of student.courses) {
          // Har bir kurs uchun oxirgi to'lovni topamiz
          // @ts-ignore
          const lastPayment = await this.prisma.payment.findFirst({
            where: { studentId: student.id, courseId: course.id },
            orderBy: { paidUntil: 'desc' }
          });

          if (!lastPayment || !lastPayment.paidUntil) continue;

          const paidUntil = new Date(lastPayment.paidUntil);
          paidUntil.setHours(0, 0, 0, 0);

          const diffTime = paidUntil.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Muddatga 3 kun yoki undan kam qolgan bo'lsa (yoki o'tib ketgan bo'lsa)
          if (diffDays <= 3) {
            let dayLabel = "";
            if (diffDays > 0) dayLabel = `${diffDays} kundan keyin`;
            else if (diffDays === 0) dayLabel = `bugun`;
            else dayLabel = `${Math.abs(diffDays)} kun oldin o'tib ketgan`;

            const message = `⏳ <b>TO'LOV OGOHLANTIRISHI</b>\n\n` +
                            `Hurmatli <b>${student.name}</b>, sizning <b>${course.name}</b> kursingiz uchun to'lov muddati <b>${dayLabel}</b> tugaydi.\n\n` +
                            `To'lov muddati: <code>${paidUntil.toLocaleDateString('uz-UZ')}</code> gacha.\n\n` +
                            `<i>Darslar to'xtab qolmasligi uchun to'lovni amalga oshirishingizni so'raymiz.</i> ✅`;

            // Talabaga yuborish
            if (student.telegramId) {
              await this.sendMsg(center.botToken, student.telegramId, message);
            }
            // Ota-onasiga yuborish
            if (student.parentTelegramId) {
              const parentMsg = message.replace(`Hurmatli <b>${student.name}</b>`, `Hurmatli ota-ona, farzandingiz <b>${student.name}</b>`);
              await this.sendMsg(center.botToken, student.parentTelegramId, parentMsg);
            }
          }
        }
      }
    }
    this.logger.debug('To\'lov ogohlantirishlari yakunlandi.');
  }

  // Har kuni soat 10:00 da markazlar muddatini tekshiradi
  @Cron('0 0 10 * * *')
  async handleCenterSubscriptionReminders() {
    this.logger.debug('Markazlar muddati tekshiruvi boshlandi...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const centers = await this.prisma.center.findMany({
      where: {
        tariffExpiresAt: { not: null }
      }
    });

    for (const center of centers) {
       const expiry = new Date(center.tariffExpiresAt!);
       expiry.setHours(0, 0, 0, 0);

       const diffTime = expiry.getTime() - today.getTime();
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

       // Agar muddati 5, 3 yoki 1 kun qolgan bo'lsa (yoki bugun tugasa)
       if (diffDays <= 5 && diffDays >= 0) {
          const message = `🏢 <b>MARKAZ TARIF OGOHLANTIRISHI</b>\n\n` +
                          `Markaz: <b>${center.name}</b>\n` +
                          `Tarif: <b>${center.tariff}</b>\n` +
                          `Holati: <b>${diffDays === 0 ? "Bugun tugaydi!" : diffDays + " kun qoldi"}</b>\n` +
                          `Amal qilish muddati: <code>${expiry.toLocaleDateString('uz-UZ')}</code>\n\n` +
                          `<i>Iltimos, xizmat uzilib qolmasligi uchun tarifni uzaytiring.</i> 💳`;

          // Markaz botiga yuboramiz (agar bo'lsa)
          if (center.botToken && center.botToken !== "none") {
              // Markazning barcha OWNER larini topamiz
              const owners = await this.prisma.user.findMany({
                  where: { centerId: center.id, role: 'OWNER', telegramId: { not: null } } as any
              });

              for (const owner of owners) {
                  const ownerAny = owner as any;
                  if (ownerAny.telegramId) {
                      await this.sendMsg(center.botToken, ownerAny.telegramId, message);
                  }
              }
          }

          // Super Adminlarga ham yuboramiz (tizim boshqaruvchisi uchun)
          const superAdmins = await this.prisma.user.findMany({
              where: { role: 'SUPER_ADMIN', telegramId: { not: null } } as any
          });

          // Super adminlarga yuborish uchun markazlardan birining botidan foydalanamiz 
          // yoki tizim bo'yicha birinchi botdan
          const systemBot = centers.find(c => c.botToken && c.botToken !== "none")?.botToken;
          if (systemBot) {
              const adminMsg = `🚨 <b>ADMIN: MARKAZ MUDDATI TUGAYAPTI</b>\n\n` + message;
              for (const admin of superAdmins) {
                  const adminAny = admin as any;
                  if (adminAny.telegramId) {
                      await this.sendMsg(systemBot, adminAny.telegramId, adminMsg);
                  }
              }
          }
       }
    }
    this.logger.debug('Markazlar muddati tekshiruvi yakunlandi.');
  }

  private async sendMsg(token: string, chatId: string, text: string) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } catch (e) {
      this.logger.error(`Xabar yuborishda xato (chatId: ${chatId}): ${e.message}`);
    }
  }
}
