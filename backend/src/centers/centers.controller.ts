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
    console.log("Creating center with data:", data);
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

  @Put(':id')
  @Post(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    console.log(`Updating center ${id} with data:`, data);
    
    // Safely parse dates
    const parseDate = (d: any) => {
        if (!d) return undefined;
        const date = new Date(d);
        return isNaN(date.getTime()) ? undefined : date;
    };

    const updateData: any = {
      name: data.name,
      login: data.login,
      botToken: data.botToken,
      eskizEmail: data.eskizEmail,
      eskizPassword: data.eskizPassword,
      smsEnabled: data.smsEnabled,
      tariff: data.tariff,
      tariffType: data.tariffType,
      tariffStartedAt: parseDate(data.tariffStartedAt),
      tariffExpiresAt: parseDate(data.tariffExpiresAt),
    };

    // Only update password if provided
    if (data.pass) {
        updateData.password = data.pass;
    }

    return this.prisma.center.update({
      where: { id: parseInt(id) },
      data: updateData
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
      } as any
    });
  }

  @Post('request-upgrade')
  async requestUpgrade(@Req() req: any, @Body() data: { tariff: string }) {
    const centerId = req.user.centerId;
    return this.prisma.subscriptionRequest.create({
      data: {
        centerId,
        tariff: data.tariff,
        status: 'Pending'
      }
    });
  }

  @Get('upgrade-requests')
  async getUpgradeRequests() {
    return this.prisma.subscriptionRequest.findMany({
      where: { status: 'Pending' },
      include: { center: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
