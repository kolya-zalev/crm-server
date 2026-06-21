import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

type AuthRequest = {
  user: {
    id: string;
  };
};

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.notificationsService.findForUser(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: AuthRequest) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Post('read-all')
  markAllAsRead(@Request() req: AuthRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
