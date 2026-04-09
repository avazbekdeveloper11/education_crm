import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    send(req: any, body: {
        target: 'STUDENTS' | 'LEADS' | 'ALL' | 'GROUP' | 'PARENTS';
        message: string;
        groupId?: number;
    }): Promise<{
        successCount: number;
        failCount: number;
    }>;
}
