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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendBulkNotification(centerId, target, message, groupId) {
        const center = await this.prisma.center.findUnique({
            where: { id: centerId },
        });
        if (!center || !center.botToken) {
            throw new Error('Markaz yoki bot tokeni topilmadi');
        }
        let recipients = [];
        if (target === 'STUDENTS' || target === 'ALL') {
            const students = await this.prisma.student.findMany({
                where: { centerId, status: 'Active', telegramId: { not: null } },
                select: { telegramId: true, name: true }
            });
            recipients.push(...students.map(s => ({ chatId: s.telegramId, name: s.name })));
        }
        if (target === 'GROUP' && groupId) {
            const students = await this.prisma.student.findMany({
                where: {
                    centerId,
                    status: 'Active',
                    telegramId: { not: null },
                    groups: { some: { id: groupId } }
                },
                select: { telegramId: true, name: true }
            });
            recipients.push(...students.map(s => ({ chatId: s.telegramId, name: s.name })));
        }
        if (target === 'PARENTS' || target === 'ALL') {
            const parents = await this.prisma.student.findMany({
                where: { centerId, status: 'Active', parentTelegramId: { not: null } },
                select: { parentTelegramId: true, name: true }
            });
            recipients.push(...parents.map(s => ({ chatId: s.parentTelegramId, name: `Parent of ${s.name}` })));
        }
        recipients = recipients.filter(r => r.chatId && r.chatId !== "");
        let successCount = 0;
        let failCount = 0;
        for (const r of recipients) {
            try {
                const response = await fetch(`https://api.telegram.org/bot${center.botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: r.chatId,
                        text: message
                    })
                });
                if (response.ok) {
                    successCount++;
                }
                else {
                    failCount++;
                    this.logger.error(`Xabar yuborishda xato (${r.name}): ${await response.text()}`);
                }
            }
            catch (e) {
                failCount++;
                this.logger.error(`Xabar yuborishda xato (${r.name}): ${e.message}`);
            }
        }
        return { successCount, failCount };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map