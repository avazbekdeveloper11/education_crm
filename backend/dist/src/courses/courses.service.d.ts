import { PrismaService } from '../prisma/prisma.service';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(centerId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        description: string | null;
        duration: number;
        price: number;
    }[]>;
    create(data: any, centerId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        description: string | null;
        duration: number;
        price: number;
    }>;
    update(id: number, data: any, centerId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        description: string | null;
        duration: number;
        price: number;
    }>;
    remove(id: number, centerId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAll(req: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        description: string | null;
        duration: number;
        price: number;
    }[]>;
    create(req: any, body: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        description: string | null;
        duration: number;
        price: number;
    }>;
    update(req: any, id: string, body: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        centerId: number;
        description: string | null;
        duration: number;
        price: number;
    }>;
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
