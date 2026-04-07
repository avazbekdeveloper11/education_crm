import { Module } from '@nestjs/common';
import { CoursesService, CoursesController } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CoursesService, PrismaService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
