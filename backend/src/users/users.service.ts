import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(centerId: number) {
    // @ts-ignore
    return this.prisma.user.findMany({
      where: { centerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, centerId: number) {
    // @ts-ignore
    return this.prisma.user.create({
      data: {
        login: data.login,
        password: data.password,
        name: data.name,
        role: data.role || 'CASHIER',
        specialization: data.specialization,
        centerId: centerId,
      }
    });
  }

  async update(id: number, data: any, centerId: number) {
    // @ts-ignore
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.centerId !== centerId) {
      throw new Error('User not found or access denied');
    }

    const updateData: any = {
      login: data.login,
      name: data.name,
      role: data.role,
      specialization: data.specialization,
    };
    if (data.password && data.password.trim() !== "") {
      updateData.password = data.password;
    }

    // @ts-ignore
    return this.prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: number, centerId: number) {
    // @ts-ignore
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.centerId !== centerId) {
      throw new Error('User not found or access denied');
    }
    // @ts-ignore
    return this.prisma.user.delete({ where: { id } });
  }
}
