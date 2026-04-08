import { GroupsService } from './groups.service';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    findAll(req: any): Promise<({
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
    create(req: any, body: any): Promise<{
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
    update(req: any, id: string, body: any): Promise<{
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
    findOne(req: any, id: string): Promise<({
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
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
