"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const centers_controller_1 = require("./centers/centers.controller");
const prisma_service_1 = require("./prisma/prisma.service");
const students_module_1 = require("./students/students.module");
const courses_module_1 = require("./courses/courses.module");
const groups_module_1 = require("./groups/groups.module");
const payments_module_1 = require("./payments/payments.module");
const users_module_1 = require("./users/users.module");
const attendance_module_1 = require("./attendance/attendance.module");
const reports_module_1 = require("./reports/reports.module");
const leads_module_1 = require("./leads/leads.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, students_module_1.StudentsModule, courses_module_1.CoursesModule, groups_module_1.GroupsModule, payments_module_1.PaymentsModule, users_module_1.UsersModule, attendance_module_1.AttendanceModule, reports_module_1.ReportsModule, leads_module_1.LeadsModule],
        controllers: [app_controller_1.AppController, centers_controller_1.CentersController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map