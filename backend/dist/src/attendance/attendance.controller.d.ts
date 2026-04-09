import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    mark(data: any, req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getByGroup(id: string, req: any): Promise<({
        student: {
            id: number;
            name: string;
            status: string;
            createdAt: Date;
            centerId: number;
            phone: string;
            address: string | null;
            dob: string | null;
            telegramId: string | null;
            parentTelegramId: string | null;
            parentPhone: string | null;
            updatedAt: Date;
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        centerId: number;
        studentId: number;
        date: Date;
        groupId: number;
    })[]>;
    getByStudent(id: string, req: any): Promise<({
        group: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            teacher: string | null;
            days: string | null;
            time: string | null;
            courseId: number;
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        centerId: number;
        studentId: number;
        date: Date;
        groupId: number;
    })[]>;
}
