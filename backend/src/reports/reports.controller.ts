import { Controller, Get, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardStats(@Request() req: any, @Query('startDate') start: string, @Query('endDate') end: string) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.reportsService.getDashboardStats(req.user.centerId, start, end);
  }

  @Get('finance')
  getFinanceReport(@Request() req: any, @Query('startDate') start: string, @Query('endDate') end: string) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.reportsService.getFinanceReport(req.user.centerId, start, end);
  }

  @Get('students')
  getStudentsReport(@Request() req: any, @Query('startDate') start: string, @Query('endDate') end: string) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.reportsService.getStudentsReport(req.user.centerId, start, end);
  }

  @Get('courses')
  getCourseDistribution(@Request() req: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return this.reportsService.getCourseDistribution(req.user.centerId);
  }
}
