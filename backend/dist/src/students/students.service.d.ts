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
    }>;
    remove(id: number, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
