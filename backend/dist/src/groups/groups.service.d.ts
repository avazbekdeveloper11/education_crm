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
        }[];
        course: {
            id: number;
            name: string;
            createdAt: Date;
            centerId: number;
            description: string | null;
            duration: number;
            price: number;
        };
        _count: {
            students: number;
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
    })[]>;
    create(data: any, centerId: number): Promise<{
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
    }>;
    update(id: number, data: any, centerId: number): Promise<{
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
    }>;
    remove(id: number, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
