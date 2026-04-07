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
        role: string;
        specialization: string | null;
        centerId: number | null;
    }[]>;
    create(data: any, centerId: number): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        role: string;
        specialization: string | null;
        centerId: number | null;
    }>;
    update(id: number, data: any, centerId: number): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        role: string;
        specialization: string | null;
        centerId: number | null;
    }>;
    remove(id: number, centerId: number): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        role: string;
        specialization: string | null;
        centerId: number | null;
    }>;
}
