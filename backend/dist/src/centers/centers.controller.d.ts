import { PrismaService } from '../prisma/prisma.service';
export declare class CentersController {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(): Promise<{
        id: number;
        login: string;
        name: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }[]>;
    create(data: any): Promise<{
        id: number;
        login: string;
        name: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: number;
        login: string;
        name: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: number;
        login: string;
        name: string;
        password: string;
        status: string;
        botToken: string | null;
        createdAt: Date;
    }>;
}
