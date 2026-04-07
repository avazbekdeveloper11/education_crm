import { PrismaService } from '../prisma/prisma.service';
export declare class LeadsService {
    private prisma;
    constructor(prisma: PrismaService);
    createLead(centerId: number, data: {
        name: string;
        phone: string;
        source?: string;
        courseId?: number;
        notes?: string;
    }): Promise<{
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
    getLeads(centerId: number, query?: {
        status?: string;
        courseId?: number;
    }): Promise<({
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
    updateLead(id: number, centerId: number, data: any): Promise<{
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
    deleteLead(id: number, centerId: number): Promise<{
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
    convertToStudent(id: number, centerId: number): Promise<{
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
