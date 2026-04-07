import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [GroupsService, PrismaService],
  controllers: [GroupsController],
  exports: [GroupsService],
})
export class GroupsModule {}
