import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) { }

  async create(centerId: number, userId: number, data: { studentId: number, courseId: number, amount: number, paymentType?: string, notes?: string, periodFrom?: Date, periodTo?: Date }) {
    const payment = await (this.prisma.payment as any).create({
      data: {
        amount: data.amount,
        paymentType: data.paymentType || 'CASH',
        notes: data.notes,
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        paidUntil: data.periodTo,
        student: { connect: { id: data.studentId } },
        course: { connect: { id: data.courseId } },
        center: { connect: { id: centerId } },
        user: { connect: { id: userId } },
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
  }

  async findAll(centerId: number) {
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
