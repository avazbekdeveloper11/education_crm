import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Request() req: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.usersService.findAll(req.user.centerId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.usersService.create(data, req.user.centerId);
  }

  @Put('me')
  updateMe(@Request() req: any, @Body() data: any) {
    return this.usersService.update(req.user.userId, data, req.user.centerId);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    return this.usersService.update(+id, data, req.user.centerId);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Access denied');
    }
    if (req.user.userId === +id) {
        throw new ForbiddenException('You cannot delete your own account');
    }
    return this.usersService.remove(+id, req.user.centerId);
  }
}
