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
    getLeads(centerId: number, query?: {
        status?: string;
        courseId?: number;
    }): Promise<({
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
    updateLead(id: number, centerId: number, data: any): Promise<{
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
    deleteLead(id: number, centerId: number): Promise<{
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
    convertToStudent(id: number, centerId: number): Promise<{
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
