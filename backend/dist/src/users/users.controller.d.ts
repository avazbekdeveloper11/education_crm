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
        centerId: number | null;
        role: string;
        specialization: string | null;
    }[]>;
    create(req: any, data: any): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        centerId: number | null;
        role: string;
        specialization: string | null;
    }>;
    update(req: any, id: string, data: any): Promise<{
        id: number;
        login: string;
        name: string | null;
        password: string;
        createdAt: Date;
        centerId: number | null;
        role: string;
        specialization: string | null;
    }>;
    remove(req: any, id: string): Promise<{
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
