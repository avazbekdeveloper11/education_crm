import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(centerId: number): Promise<({
        courses: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            description: string | null;
            duration: number;
            price: number;
        }[];
        groups: ({
            course: {
                id: number;
                name: string;
                createdAt: Date;
                centerId: number;
                description: string | null;
                duration: number;
                price: number;
            };
        } & {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            days: string | null;
            teacher: string | null;
            time: string | null;
            courseId: number;
        })[];
        payments: {
            id: number;
            createdAt: Date;
            centerId: number;
            courseId: number;
            amount: number;
            studentId: number;
            paymentDate: Date;
            paidUntil: Date | null;
            paymentType: string;
            periodFrom: Date | null;
            periodTo: Date | null;
            notes: string | null;
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
    })[]>;
    create(data: any, centerId: number): Promise<{
        courses: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            description: string | null;
            duration: number;
            price: number;
        }[];
        groups: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            days: string | null;
            teacher: string | null;
            time: string | null;
            courseId: number;
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
    }>;
    update(id: number, data: any, centerId: number): Promise<{
        courses: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            description: string | null;
            duration: number;
            price: number;
        }[];
        groups: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            days: string | null;
            teacher: string | null;
            time: string | null;
            courseId: number;
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
    }>;
    remove(id: number, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
