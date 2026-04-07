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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let LeadsController = class LeadsController {
    leadsService;
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async create(req, body) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.leadsService.createLead(req.user.centerId, body);
    }
    async findAll(req, query) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.leadsService.getLeads(req.user.centerId, query);
    }
    async update(id, req, body) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.leadsService.updateLead(Number(id), req.user.centerId, body);
    }
    async remove(id, req) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.leadsService.deleteLead(Number(id), req.user.centerId);
    }
    async convert(id, req) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.leadsService.convertToStudent(Number(id), req.user.centerId);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/convert'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "convert", null);
exports.LeadsController = LeadsController = __decorate([
    (0, common_1.Controller)('leads'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map