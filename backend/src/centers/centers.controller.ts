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

  // ===== STATIC ROUTES FIRST (before :id) =====

  @Get('me/profile')
  async getMe(@Req() req: any) {
    const centerId = req.user.centerId;
    if (!centerId) return null;
    return this.prisma.center.findUnique({
      where: { id: centerId }
    });
  }

  @Get('upgrade-requests')
  async getUpgradeRequests() {
    return (this.prisma as any).subscriptionRequest.findMany({
      where: { status: 'Pending' },
      include: { center: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Put('me/credentials')
  async updateMe(@Req() req: any, @Body() data: any) {
    const centerId = req.user.centerId;
    if (!centerId) return { error: 'No center assigned' };
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
    if (!centerId) return { error: 'No center assigned' };
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
  async requestUpgrade(@Req() req: any, @Body() data: { tariff: string; billingCycle?: string }) {
    const centerId = req.user.centerId;
    
    // So'rovni bazaga yozish
    const request = await (this.prisma as any).subscriptionRequest.create({
      data: {
        centerId,
        tariff: data.tariff,
        tariffType: data.billingCycle || 'Monthly',
        status: 'Pending'
      }
    });

    // Markaz nomini olish
    let centerName = 'Noma\'lum';
    try {
      const center = await this.prisma.center.findUnique({ where: { id: centerId } });
      if (center) centerName = center.name;
    } catch (e) {}

    // @unex_admin ga Telegram xabar yuborish
    const botToken = process.env.ADMIN_BOT_TOKEN;
    const chatId = process.env.ADMIN_CHAT_ID;
    if (botToken && chatId) {
      const billingLabel = (data.billingCycle || 'Monthly') === 'Yearly' ? 'Yillik' : 'Oylik';
      const message = `🔔 <b>YANGI TARIF SO'ROVI</b>\n\n` +
        `🏢 Markaz: <b>${centerName}</b>\n` +
        `📦 So'ralgan tarif: <b>${data.tariff}</b>\n` +
        `📅 To'lov turi: <b>${billingLabel}</b>\n` +
        `🕐 Vaqt: <code>${new Date().toLocaleString('uz-UZ')}</code>\n\n` +
        `<i>Setup panelidan tasdiqlang yoki rad eting.</i>`;

      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }).catch(err => console.error('Admin Telegram xabar xatosi:', err.message));
    }

    return request;
  }

  @Post('approve-upgrade/:requestId')
  async approveUpgrade(@Param('requestId') requestId: string) {
    const request = await (this.prisma as any).subscriptionRequest.findUnique({
      where: { id: parseInt(requestId) }
    });
    if (!request) throw new Error('Request not found');

    // Tarifni yangilash
    const now = new Date();
    const tariffType = request.tariffType || 'Monthly';
    const expiresAt = new Date(now);
    if (tariffType === 'Yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Markaz tarifini yangilash
    await this.prisma.center.update({
      where: { id: request.centerId },
      data: {
        tariff: request.tariff,
        tariffType: tariffType,
        tariffStartedAt: now,
        tariffExpiresAt: expiresAt,
      } as any
    });

    // So'rovni tasdiqlangan deb belgilash
    return (this.prisma as any).subscriptionRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: 'Approved' }
    });
  }

  @Post('reject-upgrade/:requestId')
  async rejectUpgrade(@Param('requestId') requestId: string) {
    return (this.prisma as any).subscriptionRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: 'Rejected' }
    });
  }

  // ===== PARAMETERIZED ROUTES LAST =====

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
}
