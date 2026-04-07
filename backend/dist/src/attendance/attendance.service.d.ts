import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    markAttendance(data: any, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
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
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        centerId: number;
        studentId: number;
        groupId: number;
        date: Date;
    })[]>;
    getStudentAttendance(studentId: number, centerId: number): Promise<({
        group: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            days: string | null;
            teacher: string | null;
            time: string | null;
            courseId: number;
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        centerId: number;
        studentId: number;
        groupId: number;
        date: Date;
    })[]>;
}
