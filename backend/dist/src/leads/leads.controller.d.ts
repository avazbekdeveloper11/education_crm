import { LeadsService } from './leads.service';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(req: any, body: any): Promise<{
        course: {
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        centerId: number;
        courseId: number | null;
        phone: string;
        updatedAt: Date;
        notes: string | null;
        source: string | null;
    }>;
    findAll(req: any, query: any): Promise<({
        course: {
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        centerId: number;
        courseId: number | null;
        phone: string;
        updatedAt: Date;
        notes: string | null;
        source: string | null;
    })[]>;
    update(id: string, req: any, body: any): Promise<{
        course: {
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        centerId: number;
        courseId: number | null;
        phone: string;
        updatedAt: Date;
        notes: string | null;
        source: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        name: string;
        status: string;
        createdAt: Date;
        centerId: number;
        courseId: number | null;
        phone: string;
        updatedAt: Date;
        notes: string | null;
        source: string | null;
    }>;
    convert(id: string, req: any): Promise<{
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
    }>;
}
