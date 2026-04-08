import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(req: any, body: {
        studentId: number;
        courseId: number;
        amount: number;
        paymentType?: string;
        notes?: string;
        periodFrom?: string;
        periodTo?: string;
    }): Promise<any>;
    findAll(req: any): Promise<({
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
    findByStudent(req: any, studentId: string): Promise<({
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
    remove(req: any, id: string): Promise<{
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
