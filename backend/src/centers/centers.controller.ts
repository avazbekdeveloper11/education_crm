import { Controller, Get, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
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
        botToken: data.botToken
      }
    });

    try {
        // Automatically create a related user with OWNER role
        // @ts-ignore
        await this.prisma.user.create({
            data: {
                name: data.name + " (Boshqaruvchi)",
                login: data.login,
                password: data.pass,
                role: 'OWNER',
                centerId: center.id
            }
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
        botToken: data.botToken
      }
    });
  }
}
