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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLead(centerId, data) {
        return this.prisma.lead.create({
            data: {
                ...data,
                centerId,
            },
            include: { course: { select: { name: true } } },
        });
    }
    async getLeads(centerId, query) {
        return this.prisma.lead.findMany({
            where: {
                centerId,
                ...(query?.status && { status: query.status }),
                ...(query?.courseId && { courseId: Number(query.courseId) }),
            },
            include: { course: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateLead(id, centerId, data) {
        return this.prisma.lead.update({
            where: { id, centerId },
            data,
            include: { course: { select: { name: true } } },
        });
    }
    async deleteLead(id, centerId) {
        return this.prisma.lead.delete({
            where: { id, centerId },
        });
    }
    async convertToStudent(id, centerId) {
        const lead = await this.prisma.lead.findUnique({
            where: { id, centerId },
        });
        if (!lead)
            throw new Error('Lead not found');
        const student = await this.prisma.student.create({
            data: {
                name: lead.name,
                phone: lead.phone,
                centerId: lead.centerId,
                status: 'Active',
            }
        });
        await this.prisma.lead.update({
            where: { id },
            data: { status: 'Student' }
        });
        return student;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map