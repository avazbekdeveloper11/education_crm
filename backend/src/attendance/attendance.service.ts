import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markAttendance(data: any, centerId: number) {
    const { groupId, date, records } = data; // records: [{studentId, status}]
    
    const attendanceDate = new Date(date);
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
    return this.prisma.attendance.createMany({
      data: createData,
    });
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
