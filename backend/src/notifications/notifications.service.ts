import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async sendBulkNotification(
    centerId: number,
    target: 'STUDENTS' | 'LEADS' | 'ALL' | 'GROUP' | 'PARENTS',
    message: string,
    groupId?: number
  ) {
    const center = await this.prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!center || !center.botToken) {
      throw new Error('Markaz yoki bot tokeni topilmadi');
    }

    let recipients = [];

    if (target === 'STUDENTS' || target === 'ALL') {
      const students = await this.prisma.student.findMany({
        where: { centerId, status: 'Active', telegramId: { not: null } },
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

    if (target === 'PARENTS' || target === 'ALL') {
      const parents = await this.prisma.student.findMany({
        where: { centerId, status: 'Active', parentTelegramId: { not: null } },
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

