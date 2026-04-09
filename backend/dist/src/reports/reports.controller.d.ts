import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(req: any, start: string, end: string): Promise<{
        totalStudents: number;
        totalGroups: number;
        totalTeachers: number;
        todayRevenue: number;
        periodRevenue: number;
    }>;
    getFinanceReport(req: any, start: string, end: string): Promise<{
        recentPayments: ({
            course: {
                name: string;
            };
            student: {
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            centerId: number;
            courseId: number;
            amount: number;
            paymentDate: Date;
            paidUntil: Date | null;
            paymentType: string;
            periodFrom: Date | null;
            periodTo: Date | null;
            notes: string | null;
            studentId: number;
        })[];
        dailyStats: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PaymentGroupByOutputType, "paymentDate"[]> & {
            _sum: {
                amount: number | null;
            };
        })[];
    }>;
    getStudentsReport(req: any, start: string, end: string): Promise<{
        totalByStatus: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.StudentGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        studentGrowth: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.StudentGroupByOutputType, "createdAt"[]> & {
            _count: number;
        })[];
    }>;
    getCourseDistribution(req: any): Promise<{
        name: string;
        studentCount: number;
        price: number;
    }[]>;
}
