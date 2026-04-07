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
    create(req: any, body: any): Promise<{
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
    update(req: any, id: string, body: any): Promise<{
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
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
