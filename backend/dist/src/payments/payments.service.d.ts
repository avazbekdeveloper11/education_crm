import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(centerId: number, data: {
        studentId: number;
        courseId: number;
        amount: number;
        paymentType?: string;
        notes?: string;
        periodFrom?: Date;
        periodTo?: Date;
    }): Promise<any>;
    findAll(centerId: number): Promise<({
        course: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            description: string | null;
            duration: number;
            price: number;
        };
        student: {
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
        };
    } & {
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
    })[]>;
    findByStudent(centerId: number, studentId: number): Promise<({
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
    })[]>;
    remove(centerId: number, id: number): Promise<{
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
    }>;
}
