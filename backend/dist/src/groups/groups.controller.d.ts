import { GroupsService } from './groups.service';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    findAll(req: any): Promise<({
        students: {
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
        }[];
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
        _count: {
            students: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    })[]>;
    create(req: any, body: any): Promise<{
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    }>;
    update(req: any, id: string, body: any): Promise<{
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    }>;
    findOne(req: any, id: string, date?: string): Promise<({
        students: ({
            attendance: {
                id: number;
                status: string;
                createdAt: Date;
                centerId: number;
                studentId: number;
                date: Date;
                groupId: number;
            }[];
            absenceRequests: {
                id: number;
                createdAt: Date;
                centerId: number;
                studentId: number;
                date: Date;
                reason: string | null;
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
        })[];
        course: {
            id: number;
            name: string;
            createdAt: Date;
            description: string | null;
            duration: number;
            price: number;
            centerId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        teacher: string | null;
        days: string | null;
        time: string | null;
        courseId: number;
    }) | null>;
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
