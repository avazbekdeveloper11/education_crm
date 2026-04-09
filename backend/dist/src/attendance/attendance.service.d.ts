import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    markAttendance(data: any, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    private notifyParents;
    getGroupAttendance(groupId: number, centerId: number): Promise<({
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
    getStudentAttendance(studentId: number, centerId: number): Promise<({
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
