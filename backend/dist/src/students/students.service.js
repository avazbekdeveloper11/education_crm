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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentsService = class StudentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(centerId) {
        return this.prisma.student.findMany({
            where: { centerId },
            include: {
                courses: true,
                groups: { include: { course: true } },
                payments: true
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data, centerId) {
        return this.prisma.student.create({
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address || '',
                dob: data.dob || '',
                status: data.status || 'Active',
                centerId: centerId,
                courses: data.courseIds ? {
                    connect: data.courseIds.split(',').map((id) => ({ id: parseInt(id) }))
                } : undefined,
                groups: data.groupIds ? {
                    connect: data.groupIds.split(',').map((id) => ({ id: parseInt(id) }))
                } : undefined
            },
            include: { courses: true, groups: true }
        });
    }
    async update(id, data, centerId) {
        const std = await this.prisma.student.findUnique({ where: { id } });
        if (!std || std.centerId !== centerId) {
            throw new Error('Student not found or access denied');
        }
        return this.prisma.student.update({
            where: { id },
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
                dob: data.dob,
                status: data.status,
                courses: data.courseIds ? {
                    set: data.courseIds.split(',').map((id) => ({ id: parseInt(id) }))
                } : undefined,
                groups: data.groupIds ? {
                    set: data.groupIds.split(',').map((id) => ({ id: parseInt(id) }))
                } : undefined
            },
            include: { courses: true, groups: true }
        });
    }
    async remove(id, centerId) {
        return this.prisma.student.deleteMany({
            where: { id, centerId },
        });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map