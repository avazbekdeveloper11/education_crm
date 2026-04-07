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
    findAll(req: any): Promise<({
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
    findByStudent(req: any, studentId: string): Promise<({
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
    remove(req: any, id: string): Promise<{
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
