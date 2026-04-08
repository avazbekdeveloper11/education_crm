import { PrismaService } from '../prisma/prisma.service';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(centerId: number, user: any): Promise<({
        course: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        };
        students: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            phone: string;
            address: string | null;
            dob: string | null;
            status: string;
            telegramId: string | null;
            parentTelegramId: string | null;
            parentPhone: string | null;
            updatedAt: Date;
        }[];
        _count: {
            students: number;
        };
    } & {
        id: number;
        name: string;
        teacher: string | null;
        days: string | null;
        time: string | null;
        centerId: number;
        courseId: number;
        createdAt: Date;
    })[]>;
    create(data: any, centerId: number): Promise<{
        course: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        };
    } & {
        id: number;
        name: string;
        teacher: string | null;
        days: string | null;
        time: string | null;
        centerId: number;
        courseId: number;
        createdAt: Date;
    }>;
    update(id: number, data: any, centerId: number): Promise<{
        course: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        };
    } & {
        id: number;
        name: string;
        teacher: string | null;
        days: string | null;
        time: string | null;
        centerId: number;
        courseId: number;
        createdAt: Date;
    }>;
    remove(id: number, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    findOne(id: number, centerId: number): Promise<({
        course: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        };
        students: ({
            absenceRequests: {
                id: number;
                centerId: number;
                createdAt: Date;
                studentId: number;
                date: Date;
                reason: string | null;
            }[];
        } & {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            phone: string;
            address: string | null;
            dob: string | null;
            status: string;
            telegramId: string | null;
            parentTelegramId: string | null;
            parentPhone: string | null;
            updatedAt: Date;
        })[];
    } & {
        id: number;
        name: string;
        teacher: string | null;
        days: string | null;
        time: string | null;
        centerId: number;
        courseId: number;
        createdAt: Date;
    }) | null>;
}
