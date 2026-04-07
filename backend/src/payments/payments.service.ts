import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(centerId: number, data: { studentId: number, courseId: number, amount: number, paymentType?: string, notes?: string, periodFrom?: Date, periodTo?: Date }) {
    // @ts-ignore
    return this.prisma.payment.create({
      data: {
        amount: data.amount,
        paymentType: data.paymentType || 'CASH',
        notes: data.notes,
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        student: { connect: { id: data.studentId } },
        course: { connect: { id: data.courseId } },
        center: { connect: { id: centerId } },
      },
      include: {
        student: {
          include: {
            groups: true
          }
        },
        course: true,
      }
    });
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
