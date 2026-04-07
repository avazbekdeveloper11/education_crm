import { Injectable, Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(centerId: number) {
    // @ts-ignore
    return this.prisma.course.findMany({ where: { centerId } });
  }

  async create(data: any, centerId: number) {
    // @ts-ignore
    return this.prisma.course.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration ? parseInt(data.duration) : 1,
        price: parseFloat(data.price),
        centerId
      }
    });
  }

  async update(id: number, data: any, centerId: number) {
    // @ts-ignore
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course || (course as any).centerId !== centerId) {
      throw new Error('Course not found or access denied');
    }

    // @ts-ignore
    return this.prisma.course.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration ? parseInt(data.duration) : undefined,
        price: parseFloat(data.price)
      }
    });
  }

  async remove(id: number, centerId: number) {
    // @ts-ignore
    return this.prisma.course.deleteMany({
      where: { id, centerId }
    });
  }
}

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.coursesService.findAll(req.user.centerId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.coursesService.create(body, req.user.centerId);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.coursesService.update(parseInt(id), body, req.user.centerId);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.coursesService.remove(parseInt(id), req.user.centerId);
  }
}
