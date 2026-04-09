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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async markAttendance(data, centerId) {
        const { groupId, date, records } = data;
        const [y, m, d] = date.split('-').map(Number);
        const attendanceDate = new Date(y, m - 1, d);
        attendanceDate.setHours(0, 0, 0, 0);
        await this.prisma.attendance.deleteMany({
            where: {
                groupId,
                centerId,
                date: attendanceDate,
            },
        });
        const createData = records.map((r) => ({
            studentId: r.studentId,
            groupId,
            centerId,
            date: attendanceDate,
            status: r.status,
        }));
        const result = await this.prisma.attendance.createMany({
            data: createData,
        });
        const absentRecords = records.filter((r) => r.status === 'ABSENT');
        if (absentRecords.length > 0) {
            this.notifyParents(absentRecords, groupId, centerId, attendanceDate);
        }
        return result;
    }
    async notifyParents(absentRecords, groupId, centerId, date) {
        try {
            const center = await this.prisma.center.findUnique({ where: { id: centerId } });
            if (!center || !center.botToken || center.botToken.length < 10)
                return;
            const group = await this.prisma.group.findUnique({ where: { id: groupId } });
            if (!group)
                return;
            const formattedDate = date.toLocaleDateString('uz-UZ');
            for (const record of absentRecords) {
                const student = await this.prisma.student.findUnique({ where: { id: record.studentId } });
                if (student && student.parentTelegramId) {
                    const message = `🔔 <b>DAVOMAT HAQIDA XABAR</b>\n\n` +
                        `Hurmatli ota-ona, farzandingiz <b>${student.name}</b> bugun (<code>${formattedDate}</code>) <b>${group.name}</b> darsiga qatnashmadi. ❌\n\n` +
                        `<i>Iltimos, sababini markazimizga ma'lum qilishingizni so'raymiz.</i>`;
                    fetch(`https://api.telegram.org/bot${center.botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: student.parentTelegramId,
                            text: message,
                            parse_mode: 'HTML'
                        })
                    }).catch(err => console.error(`Bot xabar yuborishda xato (${student.name}):`, err.message));
                }
            }
        }
        catch (e) {
            console.error("NotifyParents xatoligi:", e.message);
        }
    }
    async getGroupAttendance(groupId, centerId) {
        return this.prisma.attendance.findMany({
            where: { groupId, centerId },
            include: { student: true },
            orderBy: { date: 'desc' },
        });
    }
    async getStudentAttendance(studentId, centerId) {
        return this.prisma.attendance.findMany({
            where: { studentId, centerId },
            include: { group: true },
            orderBy: { date: 'desc' }
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map