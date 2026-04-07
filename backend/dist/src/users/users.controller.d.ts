import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any): Promise<{
        id: number;
        login: string;
        password: string;
        name: string | null;
        role: string;
        specialization: string | null;
        centerId: number | null;
        createdAt: Date;
    }[]>;
    create(req: any, data: any): Promise<{
        id: number;
        login: string;
        password: string;
        name: string | null;
        role: string;
        specialization: string | null;
        centerId: number | null;
        createdAt: Date;
    }>;
    update(req: any, id: string, data: any): Promise<{
        id: number;
        login: string;
        password: string;
        name: string | null;
        role: string;
        specialization: string | null;
        centerId: number | null;
        createdAt: Date;
    }>;
    remove(req: any, id: string): Promise<{
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
