import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) { }

  async create(centerId: number, userId: number, data: { studentId: number, courseId: number, amount: number, paymentType?: string, notes?: string, periodFrom?: Date, periodTo?: Date }) {
    try {
      const payment = await (this.prisma.payment as any).create({
        data: {
          amount: data.amount,
          paymentType: data.paymentType || 'CASH',
          notes: data.notes,
          periodFrom: data.periodFrom,
          periodTo: data.periodTo,
          paidUntil: data.periodTo,
          student: { connect: { id: Number(data.studentId) } },
          course: { connect: { id: Number(data.courseId) } },
          center: { connect: { id: Number(centerId) } },
          user: userId ? { connect: { id: Number(userId) } } : undefined,
        },
        include: {
          student: true,
          course: true,
          user: true,
        }
      });

      // Trigger notification
      this.notifications.handlePaymentNotification(payment).catch(err => {
        console.error('Notification error:', err);
      });

      return payment;
    } catch (error) {
      console.error('Payment creation error:', error);
      // Fallback: try without connecting user if it failed (maybe userId column doesn't exist yet)
      try {
        const payment = await (this.prisma.payment as any).create({
          data: {
            amount: data.amount,
            paymentType: data.paymentType || 'CASH',
            notes: data.notes,
            periodFrom: data.periodFrom,
            periodTo: data.periodTo,
            paidUntil: data.periodTo,
            student: { connect: { id: Number(data.studentId) } },
            course: { connect: { id: Number(data.courseId) } },
            center: { connect: { id: Number(centerId) } },
          },
          include: {
            student: true,
            course: true,
          }
        });
        this.notifications.handlePaymentNotification(payment).catch(e => console.error(e));
        return payment;
      } catch (innerError) {
        console.error('Payment fallback failed:', innerError);
        throw innerError;
      }
    }
  }

  async findAll(centerId: number) {
    if (!centerId) return [];
    // @ts-ignore
    return this.prisma.payment.findMany({
      where: { centerId },
      include: {
        student: {
          include: {
            groups: true
          }
        },
        course: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStudent(centerId: number, studentId: number) {
    // @ts-ignore
    return this.prisma.payment.findMany({
      where: { centerId, studentId },
      include: {
        course: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(centerId: number, id: number, data: any) {
    const payment = await (this.prisma.payment as any).findUnique({ where: { id } });
    if (!payment || (payment as any).centerId !== centerId) {
      throw new Error('Payment not found or access denied');
    }

    try {
        return await (this.prisma.payment as any).update({
            where: { id },
            data: {
                amount: data.amount ? Number(data.amount) : undefined,
                paymentType: data.paymentType,
                notes: data.notes,
                periodFrom: data.periodFrom ? new Date(data.periodFrom) : undefined,
                periodTo: data.periodTo ? new Date(data.periodTo) : undefined,
                paidUntil: data.periodTo ? new Date(data.periodTo) : undefined,
            }
        });
    } catch (err) {
        console.error('Update payment failed:', err);
        throw err;
    }
  }

  async remove(centerId: number, id: number) {
    // @ts-ignore
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || (payment as any).centerId !== centerId) {
      throw new Error('Payment not found or access denied');
    }

    // @ts-ignore
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
