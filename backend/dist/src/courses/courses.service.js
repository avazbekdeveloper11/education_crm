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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesController = exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(centerId) {
        return this.prisma.course.findMany({ where: { centerId } });
    }
    async create(data, centerId) {
        return this.prisma.course.create({
            data: {
                name: data.name,
                description: data.description,
                duration: data.duration ? parseInt(data.duration) : 1,
                price: parseFloat(data.price),
                centerId
            }
        });
    }
    async update(id, data, centerId) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course || course.centerId !== centerId) {
            throw new Error('Course not found or access denied');
        }
        return this.prisma.course.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                duration: data.duration ? parseInt(data.duration) : undefined,
                price: parseFloat(data.price)
            }
        });
    }
    async remove(id, centerId) {
        return this.prisma.course.deleteMany({
            where: { id, centerId }
        });
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
let CoursesController = class CoursesController {
    coursesService;
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    async findAll(req) {
        return this.coursesService.findAll(req.user.centerId);
    }
    async create(req, body) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.coursesService.create(body, req.user.centerId);
    }
    async update(req, id, body) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.coursesService.update(parseInt(id), body, req.user.centerId);
    }
    async remove(req, id) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.coursesService.remove(parseInt(id), req.user.centerId);
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "remove", null);
exports.CoursesController = CoursesController = __decorate([
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [CoursesService])
], CoursesController);
//# sourceMappingURL=courses.service.js.map