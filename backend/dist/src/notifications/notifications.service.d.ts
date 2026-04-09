import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendBulkNotification(centerId: number, target: 'STUDENTS' | 'LEADS' | 'ALL' | 'GROUP' | 'PARENTS', message: string, groupId?: number): Promise<{
        successCount: number;
        failCount: number;
    }>;
}
