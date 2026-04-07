import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async mark(@Body() data: any, @Req() req: any) {
    const centerId = req.user.centerId;
    return this.attendanceService.markAttendance(data, centerId);
  }

  @Get('group/:id')
  async getByGroup(@Param('id') id: string, @Req() req: any) {
    const centerId = req.user.centerId;
    return this.attendanceService.getGroupAttendance(Number(id), centerId);
  }

  @Get('student/:id')
  async getByStudent(@Param('id') id: string, @Req() req: any) {
      const centerId = req.user.centerId;
      return this.attendanceService.getStudentAttendance(Number(id), centerId);
  }
}
