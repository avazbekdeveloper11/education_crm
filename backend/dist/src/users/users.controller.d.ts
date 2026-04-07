import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        role: string;
        specialization: string | null;
        centerId: number | null;
    }[]>;
    create(req: any, data: any): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        role: string;
        specialization: string | null;
        centerId: number | null;
    }>;
    update(req: any, id: string, data: any): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        role: string;
        specialization: string | null;
        centerId: number | null;
    }>;
    remove(req: any, id: string): Promise<{
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
