import { PrismaService } from '../prisma/prisma.service';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(centerId: number, user: any): Promise<({
        students: {
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
        }[];
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
        _count: {
            students: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    })[]>;
    create(data: any, centerId: number): Promise<{
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    }>;
    update(id: number, data: any, centerId: number): Promise<{
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    }>;
    remove(id: number, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    findOne(id: number, centerId: number, dateString?: string): Promise<({
        students: ({
            attendance: {
                id: number;
                status: string;
                createdAt: Date;
                centerId: number;
                studentId: number;
                date: Date;
                groupId: number;
            }[];
            absenceRequests: {
                id: number;
                createdAt: Date;
                centerId: number;
                studentId: number;
                date: Date;
                reason: string | null;
            }[];
        } & {
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
        })[];
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    }) | null>;
}
