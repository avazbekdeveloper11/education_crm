import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(centerId: number, startDate?: string, endDate?: string): Promise<{
        totalStudents: number;
        totalGroups: number;
        totalTeachers: number;
        todayRevenue: number;
        periodRevenue: number;
    }>;
    getFinanceReport(centerId: number, startDate?: string, endDate?: string): Promise<{
        recentPayments: ({
            course: {
                name: string;
            };
            student: {
                name: string;
            };
        } & {
            centerId: number;
            amount: number;
            id: number;
            studentId: number;
            courseId: number;
            paymentDate: Date;
            paymentType: string;
            periodFrom: Date | null;
            periodTo: Date | null;
            notes: string | null;
            createdAt: Date;
        })[];
        dailyStats: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PaymentGroupByOutputType, "paymentDate"[]> & {
            _sum: {
                amount: number | null;
            };
        })[];
    }>;
    getStudentsReport(centerId: number, startDate?: string, endDate?: string): Promise<{
        totalByStatus: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.StudentGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        studentGrowth: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.StudentGroupByOutputType, "createdAt"[]> & {
            _count: number;
        })[];
    }>;
    getCourseDistribution(centerId: number): Promise<{
        name: string;
        studentCount: number;
        price: number;
    }[]>;
}
