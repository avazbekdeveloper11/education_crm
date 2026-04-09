import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) { }

  async findAll(centerId: number, user: any) {
    const where: any = { centerId };

    // If teacher, only show their groups
    if (user.role === 'TEACHER') {
      where.teacher = user.name;
    }

    // @ts-ignore
    return this.prisma.group.findMany({
      where,
      include: {
        course: true,
        students: true,
        _count: { select: { students: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, centerId: number) {
    // @ts-ignore
    return this.prisma.group.create({
      data: {
        name: data.name,
        teacher: data.teacher,
        days: data.days,
        time: data.time,
        centerId: centerId,
        courseId: parseInt(data.courseId),
      },
      include: { course: true }
    });
  }

  async update(id: number, data: any, centerId: number) {
    // Check ownership first
    // @ts-ignore
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group || (group as any).centerId !== centerId) {
      throw new Error('Group not found or access denied');
    }

    // @ts-ignore
    return this.prisma.group.update({
      where: { id },
      data: {
        name: data.name,
        teacher: data.teacher,
        days: data.days,
        time: data.time,
        courseId: data.courseId ? parseInt(data.courseId) : undefined,
      },
      include: { course: true }
    });
  }

  async remove(id: number, centerId: number) {
    // @ts-ignore
    return this.prisma.group.deleteMany({
      where: { id, centerId },
    });
  }

  async findOne(id: number, centerId: number, dateString?: string) {
    let today: Date;
    if (dateString) {
      const [y, m, d] = dateString.split('-').map(Number);
      today = new Date(y, m - 1, d);
    } else {
      today = new Date();
    }
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // @ts-ignore
    return this.prisma.group.findUnique({
      where: { id, centerId },
      include: {
        course: true,
        students: {
          include: {
            absenceRequests: { where: { date: { gte: today, lt: tomorrow } } },
            attendance: { where: { groupId: id, date: { gte: today, lt: tomorrow } } } }
        }
      }
    });
  }
}
