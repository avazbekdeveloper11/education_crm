import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.studentsService.findAll(req.user.centerId, req.user);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user.role === 'CASHIER') {
        throw new Error('Kassirga talaba yaratish huquqi berilmagan');
    }
    return this.studentsService.create(body, req.user.centerId);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.studentsService.update(parseInt(id), body, req.user.centerId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.studentsService.findOne(parseInt(id), req.user.centerId);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    if (req.user.role === 'CASHIER') {
        throw new Error('Kassirga talabani o\'chirish huquqi berilmagan');
    }
    return this.studentsService.remove(parseInt(id), req.user.centerId);
  }
}
