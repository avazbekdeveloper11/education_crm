import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.leadsService.createLead(req.user.centerId, body);
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.leadsService.getLeads(req.user.centerId, query);
  }

  @Get('reminders')
  async findReminders(@Req() req: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.leadsService.getReminders(req.user.centerId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.leadsService.updateLead(Number(id), req.user.centerId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.leadsService.deleteLead(Number(id), req.user.centerId);
  }

  @Post(':id/convert')
  async convert(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.leadsService.convertToStudent(Number(id), req.user.centerId, body);
  }
}
