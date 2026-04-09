import { PrismaService } from '../prisma/prisma.service';
export declare class CentersController {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(): Promise<{
        id: number;
        name: string;
        login: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }[]>;
    create(data: any): Promise<{
        id: number;
        name: string;
        login: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        login: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: number;
        name: string;
        login: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
    updateMe(req: any, data: any): Promise<{
        id: number;
        name: string;
        login: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
    updateProfile(req: any, data: any): Promise<{
        id: number;
        name: string;
        login: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
}
