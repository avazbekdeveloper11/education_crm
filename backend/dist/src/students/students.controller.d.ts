import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(req: any): Promise<({
        payments: {
            id: number;
            centerId: number;
            createdAt: Date;
            amount: number;
            studentId: number;
            courseId: number;
            paymentDate: Date;
            paidUntil: Date | null;
            paymentType: string;
            periodFrom: Date | null;
            periodTo: Date | null;
            notes: string | null;
        }[];
        courses: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        }[];
        groups: ({
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
            centerId: number;
            createdAt: Date;
            courseId: number;
            teacher: string | null;
            days: string | null;
            time: string | null;
        })[];
    } & {
        id: number;
        name: string;
        phone: string;
        address: string | null;
        dob: string | null;
        status: string;
        telegramId: string | null;
        parentTelegramId: string | null;
        parentPhone: string | null;
        centerId: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(req: any, body: any): Promise<{
        courses: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        }[];
        groups: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            courseId: number;
            teacher: string | null;
            days: string | null;
            time: string | null;
        }[];
    } & {
        id: number;
        name: string;
        phone: string;
        address: string | null;
        dob: string | null;
        status: string;
        telegramId: string | null;
        parentTelegramId: string | null;
        parentPhone: string | null;
        centerId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(req: any, id: string, body: any): Promise<{
        courses: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        }[];
        groups: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            courseId: number;
            teacher: string | null;
            days: string | null;
            time: string | null;
        }[];
    } & {
        id: number;
        name: string;
        phone: string;
        address: string | null;
        dob: string | null;
        status: string;
        telegramId: string | null;
        parentTelegramId: string | null;
        parentPhone: string | null;
        centerId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(req: any, id: string): Promise<({
        payments: {
            id: number;
            centerId: number;
            createdAt: Date;
            amount: number;
            studentId: number;
            courseId: number;
            paymentDate: Date;
            paidUntil: Date | null;
            paymentType: string;
            periodFrom: Date | null;
            periodTo: Date | null;
            notes: string | null;
        }[];
        courses: {
            id: number;
            name: string;
            centerId: number;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
        }[];
        groups: ({
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
            centerId: number;
            createdAt: Date;
            courseId: number;
            teacher: string | null;
            days: string | null;
            time: string | null;
        })[];
        attendance: {
            id: number;
            status: string;
            centerId: number;
            createdAt: Date;
            studentId: number;
            date: Date;
            groupId: number;
        }[];
    } & {
        id: number;
        name: string;
        phone: string;
        address: string | null;
        dob: string | null;
        status: string;
        telegramId: string | null;
        parentTelegramId: string | null;
        parentPhone: string | null;
        centerId: number;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
