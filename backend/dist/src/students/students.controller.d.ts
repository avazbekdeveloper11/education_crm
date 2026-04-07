import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(req: any): Promise<({
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
            paymentDate: Date;
            paymentType: string;
            periodFrom: Date | null;
            periodTo: Date | null;
            notes: string | null;
            studentId: number;
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
        updatedAt: Date;
    })[]>;
    create(req: any, body: any): Promise<{
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
        updatedAt: Date;
    }>;
    update(req: any, id: string, body: any): Promise<{
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
        updatedAt: Date;
    }>;
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
