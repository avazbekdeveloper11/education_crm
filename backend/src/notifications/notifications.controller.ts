import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async send(
    @Req() req: any,
    @Body() body: { target: 'STUDENTS' | 'LEADS' | 'ALL' | 'GROUP' | 'PARENTS' | 'GROUP_PARENTS'; message: string; groupId?: number }
  ) {
    return this.notificationsService.sendBulkNotification(
      req.user.centerId,
      body.target,
      body.message,
      body.groupId ? Number(body.groupId) : undefined,
      req.user
    );
  }
}

