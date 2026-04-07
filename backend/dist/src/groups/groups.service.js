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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GroupsService = class GroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(centerId, user) {
        const where = { centerId };
        if (user.role === 'TEACHER') {
            where.teacher = user.name;
        }
        return this.prisma.group.findMany({
            where,
            include: {
                course: true,
                students: true,
                _count: { select: { students: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data, centerId) {
        return this.prisma.group.create({
            data: {
                name: data.name,
                teacher: data.teacher,
                days: data.days,
                time: data.time,
                centerId: centerId,
                courseId: parseInt(data.courseId),
            },
            include: { course: true }
        });
    }
    async update(id, data, centerId) {
        const group = await this.prisma.group.findUnique({ where: { id } });
        if (!group || group.centerId !== centerId) {
            throw new Error('Group not found or access denied');
        }
        return this.prisma.group.update({
            where: { id },
            data: {
                name: data.name,
                teacher: data.teacher,
                days: data.days,
                time: data.time,
                courseId: data.courseId ? parseInt(data.courseId) : undefined,
            },
            include: { course: true }
        });
    }
    async remove(id, centerId) {
        return this.prisma.group.deleteMany({
            where: { id, centerId },
        });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map