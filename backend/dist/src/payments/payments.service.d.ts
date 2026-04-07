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
    }): Promise<{
        amount: number;
        paymentDate: Date;
        paymentType: string;
        periodFrom: Date | null;
        periodTo: Date | null;
        notes: string | null;
        createdAt: Date;
        id: number;
        studentId: number;
        courseId: number;
        centerId: number;
    }>;
    findAll(centerId: number): Promise<({
        course: {
            createdAt: Date;
            id: number;
            centerId: number;
            name: string;
            description: string | null;
            duration: number;
            price: number;
        };
        student: {
            groups: {
                createdAt: Date;
                id: number;
                courseId: number;
                centerId: number;
                name: string;
                teacher: string | null;
                days: string | null;
                time: string | null;
            }[];
        } & {
            createdAt: Date;
            id: number;
            centerId: number;
            telegramId: string | null;
            name: string;
            phone: string;
            address: string | null;
            dob: string | null;
            status: string;
            updatedAt: Date;
        };
    } & {
        amount: number;
        paymentDate: Date;
        paymentType: string;
        periodFrom: Date | null;
        periodTo: Date | null;
        notes: string | null;
        createdAt: Date;
        id: number;
        studentId: number;
        courseId: number;
        centerId: number;
    })[]>;
    findByStudent(centerId: number, studentId: number): Promise<({
        course: {
            createdAt: Date;
            id: number;
            centerId: number;
            name: string;
            description: string | null;
            duration: number;
            price: number;
        };
    } & {
        amount: number;
        paymentDate: Date;
        paymentType: string;
        periodFrom: Date | null;
        periodTo: Date | null;
        notes: string | null;
        createdAt: Date;
        id: number;
        studentId: number;
        courseId: number;
        centerId: number;
    })[]>;
    remove(centerId: number, id: number): Promise<{
        amount: number;
        paymentDate: Date;
        paymentType: string;
        periodFrom: Date | null;
        periodTo: Date | null;
        notes: string | null;
        createdAt: Date;
        id: number;
        studentId: number;
        courseId: number;
        centerId: number;
    }>;
}
