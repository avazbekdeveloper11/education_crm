import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(centerId: number): Promise<{
        id: number;
        login: string;
        password: string;
        name: string | null;
        role: string;
        specialization: string | null;
        centerId: number | null;
        createdAt: Date;
    }[]>;
    create(data: any, centerId: number): Promise<{
        id: number;
        login: string;
        password: string;
        name: string | null;
        role: string;
        specialization: string | null;
        centerId: number | null;
        createdAt: Date;
    }>;
    update(id: number, data: any, centerId: number): Promise<{
        id: number;
        login: string;
        password: string;
        name: string | null;
        role: string;
        specialization: string | null;
        centerId: number | null;
        createdAt: Date;
    }>;
    remove(id: number, centerId: number): Promise<{
        id: number;
        login: string;
        password: string;
        name: string | null;
        role: string;
        specialization: string | null;
        centerId: number | null;
        createdAt: Date;
    }>;
}
