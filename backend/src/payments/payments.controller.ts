import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Request() req: any, @Body() body: { studentId: number, courseId: number, amount: number, paymentType?: string, notes?: string, periodFrom?: string, periodTo?: string }) {
    return this.paymentsService.create(req.user.centerId, req.user.id, {
      ...body,
      paymentType: body.paymentType || 'CASH',
      periodFrom: body.periodFrom ? new Date(body.periodFrom) : undefined,
      periodTo: body.periodTo ? new Date(body.periodTo) : undefined,
    });
  }

  @Get()
  findAll(@Request() req: any) {
    return this.paymentsService.findAll(req.user.centerId);
  }

  @Get('student/:studentId')
  findByStudent(@Request() req: any, @Param('studentId') studentId: string) {
    return this.paymentsService.findByStudent(req.user.centerId, +studentId);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Faqat Owner yoki Super Admin tahrirlay oladi');
    }
    return this.paymentsService.update(req.user.centerId, +id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Faqat Owner yoki Super Admin o\'chira oladi');
    }
    return this.paymentsService.remove(req.user.centerId, +id);
  }
}
