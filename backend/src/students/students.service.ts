import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(centerId: number) {
    // @ts-ignore
    return this.prisma.student.findMany({
      where: { centerId },
      include: { 
        courses: true, 
        groups: { include: { course: true } }, 
        payments: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, centerId: number) {
    // @ts-ignore
    return this.prisma.student.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address || '',
        dob: data.dob || '',
        status: data.status || 'Active',
        centerId: centerId,
        courses: data.courseIds ? {
          connect: data.courseIds.split(',').map((id: string) => ({ id: parseInt(id) }))
        } : undefined,
        groups: data.groupIds ? {
          connect: data.groupIds.split(',').map((id: string) => ({ id: parseInt(id) }))
        } : undefined
      },
      include: { courses: true, groups: true }
    });
  }

  async update(id: number, data: any, centerId: number) {
    // Ownership check
    // @ts-ignore
    const std = await this.prisma.student.findUnique({ where: { id } });
    if (!std || (std as any).centerId !== centerId) {
      throw new Error('Student not found or access denied');
    }

    // @ts-ignore
    return this.prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        dob: data.dob,
        status: data.status,
        courses: data.courseIds ? {
          set: data.courseIds.split(',').map((id: string) => ({ id: parseInt(id) }))
        } : undefined,
        groups: data.groupIds ? {
          set: data.groupIds.split(',').map((id: string) => ({ id: parseInt(id) }))
        } : undefined
      },
      include: { courses: true, groups: true }
    });
  }

  async remove(id: number, centerId: number) {
    // @ts-ignore
    return this.prisma.student.deleteMany({
      where: { id, centerId },
    });
  }
}
