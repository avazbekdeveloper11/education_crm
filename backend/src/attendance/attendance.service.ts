import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markAttendance(data: any, centerId: number) {
    const { groupId, date, records } = data; // records: [{studentId, status}]
    
    const [y, m, d] = date.split('-').map(Number);
    const attendanceDate = new Date(y, m - 1, d);
    attendanceDate.setHours(0, 0, 0, 0);

    // Delete existing records for this group and date to avoid duplicates
    // @ts-ignore
    await this.prisma.attendance.deleteMany({
      where: {
        groupId,
        centerId,
        date: attendanceDate,
      },
    });

    // Create new records
    const createData = records.map((r: any) => ({
      studentId: r.studentId,
      groupId,
      centerId,
      date: attendanceDate,
      status: r.status,
    }));

    // @ts-ignore
    const result = await this.prisma.attendance.createMany({
      data: createData,
    });

    // Notify parents for ABSENT students
    const absentRecords = records.filter((r: any) => r.status === 'ABSENT');
    if (absentRecords.length > 0) {
      this.notifyParents(absentRecords, groupId, centerId, attendanceDate);
    }

    // Notify students for EXCUSED attendance — ask them to write reason
    const excusedRecords = records.filter((r: any) => r.status === 'EXCUSED');
    if (excusedRecords.length > 0) {
      this.notifyExcusedStudents(excusedRecords, groupId, centerId, attendanceDate);
    }

    return result;
  }

  private async notifyParents(absentRecords: any[], groupId: number, centerId: number, date: Date) {
    try {
      // @ts-ignore
      const center = await this.prisma.center.findUnique({ where: { id: centerId } });
      if (!center || !center.botToken || center.botToken.length < 10) return;

      // @ts-ignore
      const group = await this.prisma.group.findUnique({ where: { id: groupId } });
      if (!group) return;
      const formattedDate = date.toLocaleDateString('uz-UZ');

      for (const record of absentRecords) {
        // @ts-ignore
        const student = await this.prisma.student.findUnique({ where: { id: record.studentId } });

        if (student && student.parentTelegramId) {
          const message = `🔔 <b>DAVOMAT HAQIDA XABAR</b>\n\n` +
                          `Hurmatli ota-ona, farzandingiz <b>${student.name}</b> bugun (<code>${formattedDate}</code>) <b>${group.name}</b> darsiga qatnashmadi. ❌\n\n` +
                          `<i>Iltimos, sababini markazimizga ma'lum qilishingizni so'raymiz.</i>`;

          fetch(`https://api.telegram.org/bot${center.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: student.parentTelegramId,
              text: message,
              parse_mode: 'HTML'
            })
          }).catch(err => console.error(`Bot xabar yuborishda xato (${student.name}):`, err.message));
        }
      }
    } catch (e) {
      console.error("NotifyParents xatoligi:", e.message);
    }
  }

  private async notifyExcusedStudents(excusedRecords: any[], groupId: number, centerId: number, date: Date) {
    try {
      // @ts-ignore
      const center = await this.prisma.center.findUnique({ where: { id: centerId } });
      if (!center || !center.botToken || center.botToken.length < 10) return;

      // @ts-ignore
      const group = await this.prisma.group.findUnique({ where: { id: groupId } });
      if (!group) return;
      const formattedDate = date.toLocaleDateString('uz-UZ');

      for (const record of excusedRecords) {
        // @ts-ignore
        const student = await this.prisma.student.findUnique({ where: { id: record.studentId } });
        if (!student || !student.telegramId) continue;

        // Check if absence request already exists for this student and date
        // @ts-ignore
        const existing = await this.prisma.absenceRequest.findFirst({
          where: {
            studentId: student.id,
            centerId,
            date: { gte: new Date(date.getTime() - 86400000), lt: new Date(date.getTime() + 86400000) }
          }
        });
        if (existing) continue; // already submitted reason

        const message =
          `✍️ <b>KELOLMASLIK SABABI</b>\n\n` +
          `O'qituvchingiz sizni <b>${formattedDate}</b> kuni (<b>${group.name}</b>) <i>sababli</i> deb belgiladi.\n\n` +
          `Iltimos, botga qaytib <b>"✍️ Kelolmaslik"</b> tugmasini bosib, sababingizni yozing.`;

        fetch(`https://api.telegram.org/bot${center.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: student.telegramId,
            text: message,
            parse_mode: 'HTML'
          })
        }).catch(err => console.error(`EXCUSED xabar yuborishda xato (${student.name}):`, err.message));
      }
    } catch (e: any) {
      console.error('notifyExcusedStudents xatoligi:', e.message);
    }
  }

  async getGroupAttendance(groupId: number, centerId: number) {
    // @ts-ignore
    return this.prisma.attendance.findMany({
      where: { groupId, centerId },
      include: { student: true },
      orderBy: { date: 'desc' },
    });
  }

  async getStudentAttendance(studentId: number, centerId: number) {
      // @ts-ignore
      return this.prisma.attendance.findMany({
          where: { studentId, centerId },
          include: { group: true },
          orderBy: { date: 'desc' }
      });
  }
}
