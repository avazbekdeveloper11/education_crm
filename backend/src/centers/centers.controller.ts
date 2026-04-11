import { Controller, Get, Post, Body, UseGuards, Param, Delete, Put, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('centers')
@UseGuards(JwtAuthGuard)
export class CentersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAll() {
    return this.prisma.center.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post()
  async create(@Body() data: any) {
    const center = await this.prisma.center.create({
      data: {
        name: data.name,
        login: data.login,
        password: data.pass,
        botToken: data.botToken,
        eskizEmail: data.eskizEmail,
        eskizPassword: data.eskizPassword,
        smsEnabled: data.smsEnabled || false,
        tariff: data.tariff || "Standart",
        tariffType: data.tariffType || "Monthly",
        tariffStartedAt: data.tariffStartedAt ? new Date(data.tariffStartedAt) : null,
        tariffExpiresAt: data.tariffExpiresAt ? new Date(data.tariffExpiresAt) : null,
      } as any
    });

    try {
        // Automatically create a related user with OWNER role
        await this.prisma.user.create({
            data: {
                name: data.name + " (Boshqaruvchi)",
                login: data.login,
                password: data.pass,
                role: 'OWNER',
                centerId: center.id
            } as any
        });
    } catch(err) {
        console.error("Owner user creation failed", err);
    }

    return center;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prisma.center.delete({
      where: { id: parseInt(id) }
    });
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.center.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        login: data.login,
        password: data.pass,
        botToken: data.botToken,
        eskizEmail: data.eskizEmail,
        eskizPassword: data.eskizPassword,
        smsEnabled: data.smsEnabled,
        tariff: data.tariff,
        tariffType: data.tariffType,
        tariffStartedAt: data.tariffStartedAt ? new Date(data.tariffStartedAt) : undefined,
        tariffExpiresAt: data.tariffExpiresAt ? new Date(data.tariffExpiresAt) : undefined,
      } as any
    });
  }

  @Put('me/credentials')
  async updateMe(@Req() req: any, @Body() data: any) {
    const centerId = req.user.centerId;
    return this.prisma.center.update({
      where: { id: centerId },
      data: {
        login: data.login,
        password: data.password
      }
    });
  }

  @Put('me/profile')
  async updateProfile(@Req() req: any, @Body() data: any) {
    const centerId = req.user.centerId;
    return this.prisma.center.update({
      where: { id: centerId },
      data: {
        name: data.name,
        botToken: data.botToken,
        eskizEmail: data.eskizEmail,
        eskizPassword: data.eskizPassword,
        smsEnabled: data.smsEnabled
      }
    });
  }
}
