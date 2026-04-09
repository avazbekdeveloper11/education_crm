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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = TasksService_1 = class TasksService {
    prisma;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handlePaymentReminders() {
        this.logger.debug('To\'lov ogohlantirishlarini tekshirish boshlandi...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const centers = await this.prisma.center.findMany({
            where: { botToken: { not: null, notIn: ["", "none", "token"] } }
        });
        for (const center of centers) {
            if (!center.botToken)
                continue;
            const students = await this.prisma.student.findMany({
                where: {
                    centerId: center.id,
                    status: 'Active',
                },
                include: {
                    courses: true
                }
            });
            for (const student of students) {
                for (const course of student.courses) {
                    const lastPayment = await this.prisma.payment.findFirst({
                        where: { studentId: student.id, courseId: course.id },
                        orderBy: { paidUntil: 'desc' }
                    });
                    if (!lastPayment || !lastPayment.paidUntil)
                        continue;
                    const paidUntil = new Date(lastPayment.paidUntil);
                    paidUntil.setHours(0, 0, 0, 0);
                    const diffTime = paidUntil.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 3) {
                        let dayLabel = "";
                        if (diffDays > 0)
                            dayLabel = `${diffDays} kundan keyin`;
                        else if (diffDays === 0)
                            dayLabel = `bugun`;
                        else
                            dayLabel = `${Math.abs(diffDays)} kun oldin o'tib ketgan`;
                        const message = `⏳ <b>TO'LOV OGOHLANTIRISHI</b>\n\n` +
                            `Hurmatli <b>${student.name}</b>, sizning <b>${course.name}</b> kursingiz uchun to'lov muddati <b>${dayLabel}</b> tugaydi.\n\n` +
                            `To'lov muddati: <code>${paidUntil.toLocaleDateString('uz-UZ')}</code> gacha.\n\n` +
                            `<i>Darslar to'xtab qolmasligi uchun to'lovni amalga oshirishingizni so'raymiz.</i> ✅`;
                        if (student.telegramId) {
                            await this.sendMsg(center.botToken, student.telegramId, message);
                        }
                        if (student.parentTelegramId) {
                            const parentMsg = message.replace(`Hurmatli <b>${student.name}</b>`, `Hurmatli ota-ona, farzandingiz <b>${student.name}</b>`);
                            await this.sendMsg(center.botToken, student.parentTelegramId, parentMsg);
                        }
                    }
                }
            }
        }
        this.logger.debug('To\'lov ogohlantirishlari yakunlandi.');
    }
    async sendMsg(token, chatId, text) {
        try {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML'
                })
            });
        }
        catch (e) {
            this.logger.error(`Xabar yuborishda xato (chatId: ${chatId}): ${e.message}`);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)('0 17 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handlePaymentReminders", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map