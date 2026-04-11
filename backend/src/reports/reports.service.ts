import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(centerId: number, user: any, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isTeacher = user.role === 'TEACHER';
    const teacherFilter = isTeacher ? { teacher: user.name } : {};

    const [
      totalStudents,
      totalGroups,
      totalTeachers,
      todayPayments,
      periodPayments,
    ] = await Promise.all([
      this.prisma.student.count({ 
        where: { 
          centerId,
          ...(isTeacher && { 
            groups: { some: teacherFilter } 
          })
        } 
      }),
      this.prisma.group.count({ 
        where: { 
          centerId,
          ...teacherFilter
        } 
      }),
      this.prisma.user.count({ where: { centerId, role: 'TEACHER' } }),
      !isTeacher ? this.prisma.payment.aggregate({
        where: { centerId, createdAt: { gte: today } },
        _sum: { amount: true },
      }) : Promise.resolve({ _sum: { amount: 0 } }),
      !isTeacher ? this.prisma.payment.aggregate({
        where: { 
          centerId, 
          createdAt: { gte: start, lte: end } 
        },
        _sum: { amount: true },
      }) : Promise.resolve({ _sum: { amount: 0 } }),
    ]);

    return {
      totalStudents,
      totalGroups,
      totalTeachers: isTeacher ? 1 : totalTeachers,
      todayRevenue: todayPayments?._sum?.amount || 0,
      periodRevenue: periodPayments?._sum?.amount || 0,
    };
  }

  async getFinanceReport(centerId: number, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const payments = await this.prisma.payment.findMany({
      where: { 
        centerId, 
        createdAt: { 
          gte: start,
          lte: end
        } 
      },
      include: {
        student: { select: { name: true } },
        course: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const dailyStats = await this.prisma.payment.groupBy({
      by: ['paymentDate'],
      where: { 
        centerId, 
        createdAt: { 
          gte: start,
          lte: end
        } 
      },
      _sum: { amount: true },
      orderBy: { paymentDate: 'asc' },
    });

    return {
      recentPayments: payments,
      dailyStats,
    };
  }

  async getStudentsReport(centerId: number, user: any, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    if (end) end.setHours(23, 59, 59, 999);

    const isTeacher = user.role === 'TEACHER';
    const baseWhere: any = { centerId };
    if (isTeacher) {
      baseWhere.groups = { some: { teacher: user.name } };
    }

    const totalByStatus = await this.prisma.student.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: true,
    });

    const studentGrowth = await this.prisma.student.groupBy({
      by: ['createdAt'],
      where: { 
        ...baseWhere,
        createdAt: start || end ? {
            ...(start && { gte: start }),
            ...(end && { lte: end })
        } : undefined
      },
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    return {
      totalByStatus,
      studentGrowth,
    };
  }

  async getCourseDistribution(centerId: number, user: any) {
    const isTeacher = user.role === 'TEACHER';
    const courses = await this.prisma.course.findMany({
      where: { 
        centerId,
        ...(isTeacher && {
            groups: { some: { teacher: user.name } }
        })
      },
      include: {
        _count: {
          select: { students: {
            where: isTeacher ? {
                groups: { some: { teacher: user.name } }
            } : undefined
          } }
        }
      }
    });

    return courses.map(c => ({
      name: c.name,
      studentCount: c._count.students,
      price: isTeacher ? 0 : c.price
    }));
  }
}
