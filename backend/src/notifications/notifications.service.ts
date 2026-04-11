import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async getEskizToken(center: any) {
    if (!center.eskizEmail || !center.eskizPassword) return null;
    
    try {
      const response = await fetch('https://notify.eskiz.uz/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: center.eskizEmail,
          password: center.eskizPassword
        })
      });

      const data: any = await response.json();
      return data?.data?.token || null;
    } catch (e) {
      this.logger.error(`Eskiz login error: ${e.message}`);
      return null;
    }
  }

  async sendSms(phone: string, message: string, center: any) {
    if (!center.smsEnabled) return;
    const token = await this.getEskizToken(center);
    if (!token) return;

    // Uzb numbers format: 998XXXXXXXXX
    let cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone.startsWith("998")) cleanPhone = "998" + cleanPhone;

    try {
      const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mobile_phone: cleanPhone,
          message: message,
          from: '4546', // Default Eskiz sender ID
          callback_url: null
        })
      });

      if (!response.ok) {
        this.logger.error(`SMS yuborishda xato: ${await response.text()}`);
      }
    } catch (e) {
      this.logger.error(`SMS service error: ${e.message}`);
    }
  }

  async handlePaymentNotification(payment: any) {
    const center = await this.prisma.center.findUnique({
      where: { id: payment.centerId }
    });
    if (!center) return;

    const student = payment.student;
    const amountStr = Number(payment.amount).toLocaleString("ru-RU");
    const dateStr = new Date(payment.createdAt).toLocaleDateString();
    
    // Message template
    const message = `To'lov qabul qilindi!\n\nTalaba: ${student.name}\nKurs: ${payment.course.name}\nSumma: ${amountStr} UZS\nSana: ${dateStr}\n\nEduMarkaz tizimi`;

    // 1. Send via Telegram if student has telegramId
    if (center.botToken) {
      const sendTG = async (chatId: string) => {
        try {
          await fetch(`https://api.telegram.org/bot${center.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message })
          });
        } catch (e) {}
      };

      if (student.telegramId) await sendTG(student.telegramId);
      if (student.parentTelegramId) await sendTG(student.parentTelegramId);
    }

    // 2. Send via SMS if enabled
    if (center.smsEnabled) {
      if (student.phone) await this.sendSms(student.phone, message, center);
      if (student.parentPhone) await this.sendSms(student.parentPhone, message, center);
    }
  }

  async sendBulkNotification(
    centerId: number,
    target: 'STUDENTS' | 'LEADS' | 'ALL' | 'GROUP' | 'PARENTS' | 'GROUP_PARENTS',
    message: string,
    groupId?: number,
    user?: any
  ) {
    const center = await this.prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!center) {
      throw new Error('Markaz topilmadi');
    }

    if (user?.role === 'TEACHER') {
      if (target === 'STUDENTS' || target === 'PARENTS') {
           // Allowed - will filter by teacher groups below
      } else if (target === 'GROUP' || target === 'GROUP_PARENTS') {
           if (!groupId) {
             throw new Error('Guruh tanlanmagan');
           }
           const groupCheck = await this.prisma.group.findFirst({
             where: { id: groupId, centerId, teacher: user.name }
           });
           if (!groupCheck) {
             throw new Error('Sizga faqat o\'z guruhlaringizga xabar yuborishga ruxsat etilgan');
           }
      } else {
           throw new Error('Siz faqat o\'z guruhlaringiz yoki o\'quvchilaringizga xabar yuborishingiz mumkin');
      }
    }

    let recipients = [];
    const teacherFilter = user?.role === 'TEACHER' ? {
        groups: { some: { teacher: user.name } }
    } : {};

    if (target === 'STUDENTS' || target === 'ALL') {
      const students = await this.prisma.student.findMany({
        where: { centerId, status: 'Active', telegramId: { not: null }, ...teacherFilter },
        select: { telegramId: true, name: true }
      });
      recipients.push(...students.map(s => ({ chatId: s.telegramId, name: s.name })));
    }

    if (target === 'GROUP' && groupId) {
      const students = await this.prisma.student.findMany({
        where: { 
          centerId, 
          status: 'Active', 
          telegramId: { not: null },
          groups: { some: { id: groupId } }
        },
        select: { telegramId: true, name: true }
      });
      recipients.push(...students.map(s => ({ chatId: s.telegramId, name: s.name })));
    }

    if (target === 'GROUP_PARENTS' && groupId) {
      const parentStudents = await this.prisma.student.findMany({
        where: { 
          centerId, 
          status: 'Active', 
          parentTelegramId: { not: null },
          groups: { some: { id: groupId } }
        },
        select: { parentTelegramId: true, name: true }
      });
      recipients.push(...parentStudents.map(s => ({ chatId: s.parentTelegramId, name: `Parent of ${s.name}` })));
    }

    if (target === 'PARENTS' || target === 'ALL') {
      const parents = await this.prisma.student.findMany({
        where: { centerId, status: 'Active', parentTelegramId: { not: null }, ...teacherFilter },
        select: { parentTelegramId: true, name: true }
      });
      recipients.push(...parents.map(s => ({ chatId: s.parentTelegramId, name: `Parent of ${s.name}` })));
    }

    // Filter out potential nulls/empty
    recipients = recipients.filter(r => r.chatId && r.chatId !== "");

    let successCount = 0;
    let failCount = 0;

    for (const r of recipients) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${center.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: r.chatId,
            text: message
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          this.logger.error(`Xabar yuborishda xato (${r.name}): ${await response.text()}`);
        }
      } catch (e) {
        failCount++;
        this.logger.error(`Xabar yuborishda xato (${r.name}): ${e.message}`);
      }
    }

    return { successCount, failCount };
  }
}

