import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CentersController } from './centers/centers.controller';
import { PrismaService } from './prisma/prisma.service';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { GroupsModule } from './groups/groups.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ReportsModule } from './reports/reports.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [AuthModule, StudentsModule, CoursesModule, GroupsModule, PaymentsModule, UsersModule, AttendanceModule, ReportsModule, LeadsModule],
  controllers: [AppController, CentersController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
