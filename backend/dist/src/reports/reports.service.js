"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(centerId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalStudents, totalGroups, totalTeachers, todayPayments, periodPayments,] = await Promise.all([
            this.prisma.student.count({ where: { centerId } }),
            this.prisma.group.count({ where: { centerId } }),
            this.prisma.user.count({ where: { centerId, role: 'TEACHER' } }),
            this.prisma.payment.aggregate({
                where: { centerId, createdAt: { gte: today } },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: {
                    centerId,
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                },
                _sum: { amount: true },
            }),
        ]);
        return {
            totalStudents,
            totalGroups,
            totalTeachers,
            todayRevenue: todayPayments._sum.amount || 0,
            periodRevenue: periodPayments._sum.amount || 0,
        };
    }
    async getFinanceReport(centerId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        const payments = await this.prisma.payment.findMany({
            where: {
                centerId,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                student: { select: { name: true } },
                course: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const dailyStats = await this.prisma.payment.groupBy({
            by: ['paymentDate'],
            where: {
                centerId,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            _sum: { amount: true },
            orderBy: { paymentDate: 'asc' },
        });
        return {
            recentPayments: payments,
            dailyStats,
        };
    }
    async getStudentsReport(centerId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (end)
            end.setHours(23, 59, 59, 999);
        const totalByStatus = await this.prisma.student.groupBy({
            by: ['status'],
            where: { centerId },
            _count: true,
        });
        const studentGrowth = await this.prisma.student.groupBy({
            by: ['createdAt'],
            where: {
                centerId,
                createdAt: start || end ? {
                    ...(start && { gte: start }),
                    ...(end && { lte: end })
                } : undefined
            },
            _count: true,
            orderBy: { createdAt: 'asc' },
        });
        return {
            totalByStatus,
            studentGrowth,
        };
    }
    async getCourseDistribution(centerId) {
        const courses = await this.prisma.course.findMany({
            where: { centerId },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });
        return courses.map(c => ({
            name: c.name,
            studentCount: c._count.students,
            price: c.price
        }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map