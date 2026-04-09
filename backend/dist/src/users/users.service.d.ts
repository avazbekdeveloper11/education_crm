import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(centerId: number): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        centerId: number | null;
        role: string;
        specialization: string | null;
    }[]>;
    create(data: any, centerId: number): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        centerId: number | null;
        role: string;
        specialization: string | null;
    }>;
    update(id: number, data: any, centerId: number): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        centerId: number | null;
        role: string;
        specialization: string | null;
    }>;
    remove(id: number, centerId: number): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        centerId: number | null;
        role: string;
        specialization: string | null;
    }>;
}
