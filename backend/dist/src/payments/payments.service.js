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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(centerId, data) {
        return this.prisma.payment.create({
            data: {
                amount: data.amount,
                paymentType: data.paymentType || 'CASH',
                notes: data.notes,
                periodFrom: data.periodFrom,
                periodTo: data.periodTo,
                student: { connect: { id: data.studentId } },
                course: { connect: { id: data.courseId } },
                center: { connect: { id: centerId } },
            },
            include: {
                student: {
                    include: {
                        groups: true
                    }
                },
                course: true,
            }
        });
    }
    async findAll(centerId) {
        return this.prisma.payment.findMany({
            where: { centerId },
            include: {
                student: {
                    include: {
                        groups: true
                    }
                },
                course: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByStudent(centerId, studentId) {
        return this.prisma.payment.findMany({
            where: { centerId, studentId },
            include: {
                course: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(centerId, id) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment || payment.centerId !== centerId) {
            throw new Error('Payment not found or access denied');
        }
        return this.prisma.payment.delete({
            where: { id },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map