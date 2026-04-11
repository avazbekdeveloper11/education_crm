import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.groupsService.findAll(req.user.centerId, req.user);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user.role === 'CASHIER') {
        throw new Error('Kassirga guruh yaratish huquqi berilmagan');
    }
    return this.groupsService.create(body, req.user.centerId);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.groupsService.update(parseInt(id), body, req.user.centerId, req.user);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string, @Query('date') date?: string) {
    return this.groupsService.findOne(parseInt(id), req.user.centerId, date);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    if (req.user.role === 'CASHIER') {
        throw new Error('Kassirga guruhni o\'chirish huquqi berilmagan');
    }
    return this.groupsService.remove(parseInt(id), req.user.centerId, req.user);
  }
}
