import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async createLead(centerId: number, data: { name: string; phone: string; source?: string; courseId?: number; notes?: string }) {
    return this.prisma.lead.create({
      data: {
        ...data,
        centerId,
      },
      include: { course: { select: { name: true } } },
    });
  }

  async getLeads(centerId: number, query?: { status?: string; courseId?: number }) {
    return this.prisma.lead.findMany({
      where: {
        centerId,
        ...(query?.status && { status: query.status }),
        ...(query?.courseId && { courseId: Number(query.courseId) }),
      },
      include: { course: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLead(id: number, centerId: number, data: any) {
    return this.prisma.lead.update({
      where: { id, centerId },
      data,
      include: { course: { select: { name: true } } },
    });
  }

  async deleteLead(id: number, centerId: number) {
    return this.prisma.lead.delete({
      where: { id, centerId },
    });
  }

  async convertToStudent(id: number, centerId: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id, centerId },
    });

    if (!lead) throw new Error('Lead not found');

    // Create student
    const student = await this.prisma.student.create({
      data: {
        name: lead.name,
        phone: lead.phone,
        centerId: lead.centerId,
        status: 'Active',
      }
    });

    // Update lead status
    await this.prisma.lead.update({
      where: { id },
      data: { status: 'Student' }
    });

    return student;
  }
}
