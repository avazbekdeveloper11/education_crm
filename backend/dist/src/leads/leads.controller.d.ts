import { LeadsService } from './leads.service';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(req: any, body: any): Promise<{
        course: {
            name: string;
        } | null;
    } & {
        name: string;
        phone: string;
        source: string | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        centerId: number;
        courseId: number | null;
    }>;
    findAll(req: any, query: any): Promise<({
        course: {
            name: string;
        } | null;
    } & {
        name: string;
        phone: string;
        source: string | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        centerId: number;
        courseId: number | null;
    })[]>;
    update(id: string, req: any, body: any): Promise<{
        course: {
            name: string;
        } | null;
    } & {
        name: string;
        phone: string;
        source: string | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        centerId: number;
        courseId: number | null;
    }>;
    remove(id: string, req: any): Promise<{
        name: string;
        phone: string;
        source: string | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        centerId: number;
        courseId: number | null;
    }>;
    convert(id: string, req: any): Promise<{
        name: string;
        phone: string;
        status: string;
        createdAt: Date;
        id: number;
        centerId: number;
        address: string | null;
        dob: string | null;
    }>;
}
