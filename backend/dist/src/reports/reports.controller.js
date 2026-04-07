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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboardStats(req, start, end) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.reportsService.getDashboardStats(req.user.centerId, start, end);
    }
    getFinanceReport(req, start, end) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.reportsService.getFinanceReport(req.user.centerId, start, end);
    }
    getStudentsReport(req, start, end) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.reportsService.getStudentsReport(req.user.centerId, start, end);
    }
    getCourseDistribution(req) {
        if (req.user.role !== 'OWNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.reportsService.getCourseDistribution(req.user.centerId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('finance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getFinanceReport", null);
__decorate([
    (0, common_1.Get)('students'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getStudentsReport", null);
__decorate([
    (0, common_1.Get)('courses'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCourseDistribution", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map