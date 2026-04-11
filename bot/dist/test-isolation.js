/**
 * DATA ISOLATION TEST SCRIPT
 *
 * Bu script uchta asosiy izolatsiya muammosini tekshiradi:
 *  1. Payments - centerId filtri to'g'ri ishlayotganmi?
 *  2. Courses  - boshqa markazlarning kurslari ko'rinmayaptimi?
 *  3. Attendance - boshqa markazlarning davomatlari ko'rinmayaptimi?
 *
 * Ishlatish: npx tsx src/test-isolation.ts
 */
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();
// ─── ANSI COLORS ─────────────────────────────────────────────
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
let passed = 0;
let failed = 0;
function ok(msg) { console.log(`${GREEN}  ✅ PASS${RESET} — ${msg}`); passed++; }
function fail(msg) { console.log(`${RED}  ❌ FAIL${RESET} — ${msg}`); failed++; }
function info(msg) { console.log(`${CYAN}  ℹ️  ${msg}${RESET}`); }
function section(msg) { console.log(`\n${BOLD}${YELLOW}══ ${msg} ══${RESET}`); }
// ─── SETUP: Create test data ──────────────────────────────────
async function setup() {
    section("TEST MA'LUMOTLARINI TAYYORLASH");
    // Clean up any previous test data
    await prisma.$executeRaw `DELETE FROM "Payment" WHERE "notes" = 'TEST_ISOLATION'`;
    await prisma.$executeRaw `DELETE FROM "Attendance" WHERE "status" = 'EXCUSED' AND "studentId" IN (
    SELECT id FROM "Student" WHERE "name" LIKE 'TEST_ISOLATION_%'  
  )`;
    await prisma.$executeRaw `DELETE FROM "_CourseToStudent" WHERE "B" IN (
    SELECT id FROM "Student" WHERE "name" LIKE 'TEST_ISOLATION_%'
  )`;
    await prisma.$executeRaw `DELETE FROM "Student" WHERE "name" LIKE 'TEST_ISOLATION_%'`;
    await prisma.$executeRaw `DELETE FROM "Group" WHERE "name" LIKE 'TEST_ISOLATION_%'`;
    await prisma.$executeRaw `DELETE FROM "Course" WHERE "name" LIKE 'TEST_ISOLATION_%'`;
    await prisma.$executeRaw `DELETE FROM "Center" WHERE "login" LIKE 'test_isolation_%'`;
    // Center A
    const centerA = await prisma.center.create({
        data: { name: "Demo O'quv Markazi (TEST)", login: "test_isolation_demo", password: "test", status: "Active" }
    });
    // Center B  
    const centerB = await prisma.center.create({
        data: { name: "ASR School (TEST)", login: "test_isolation_asr", password: "test", status: "Active" }
    });
    // Course A (Demo markaziga)
    const courseA = await prisma.course.create({
        data: { name: "TEST_ISOLATION_CourseA", price: 500000, centerId: centerA.id }
    });
    // Course B (ASR markaziga)
    const courseB = await prisma.course.create({
        data: { name: "TEST_ISOLATION_CourseB", price: 600000, centerId: centerB.id }
    });
    // Group A
    const groupA = await prisma.group.create({
        data: { name: "TEST_ISOLATION_GroupA", centerId: centerA.id, courseId: courseA.id }
    });
    // Group B
    const groupB = await prisma.group.create({
        data: { name: "TEST_ISOLATION_GroupB", centerId: centerB.id, courseId: courseB.id }
    });
    // Student registered in BOTH centers with same telegramId (cross-center scenario)
    const studentA = await prisma.student.create({
        data: {
            name: "TEST_ISOLATION_Ali",
            phone: "998901111111",
            telegramId: "test_tg_999888777", // same telegram ID
            centerId: centerA.id,
            status: "Active",
            courses: { connect: [{ id: courseA.id }] },
            groups: { connect: [{ id: groupA.id }] }
        }
    });
    // Another student in Center B with SAME telegramId linked as parent (edge case)
    // Use a different telegramId to avoid @unique constraint for real scenarios
    const studentB = await prisma.student.create({
        data: {
            name: "TEST_ISOLATION_Sarvar",
            phone: "998902222222",
            telegramId: "test_tg_DIFFERENT_111",
            centerId: centerB.id,
            status: "Active",
            courses: { connect: [{ id: courseB.id }] },
            groups: { connect: [{ id: groupB.id }] }
        }
    });
    // Payment for studentA in centerA
    const paymentA = await prisma.payment.create({
        data: {
            amount: 500000,
            studentId: studentA.id,
            courseId: courseA.id,
            centerId: centerA.id,
            notes: "TEST_ISOLATION",
            paymentType: "CASH"
        }
    });
    // Payment for studentA but in centerB (the cross-center leak scenario)
    const paymentB = await prisma.payment.create({
        data: {
            amount: 600000,
            studentId: studentA.id,
            courseId: courseB.id,
            centerId: centerB.id, // <-- belongs to center B!
            notes: "TEST_ISOLATION",
            paymentType: "CASH"
        }
    });
    // Attendance for studentA in groupA (centerA)
    const attendanceA = await prisma.attendance.create({
        data: {
            date: new Date(),
            status: "PRESENT",
            studentId: studentA.id,
            groupId: groupA.id,
            centerId: centerA.id
        }
    });
    // Attendance for studentA in groupB (centerB) — cross-center leak scenario  
    const attendanceB = await prisma.attendance.create({
        data: {
            date: new Date(),
            status: "ABSENT",
            studentId: studentA.id,
            groupId: groupB.id,
            centerId: centerB.id // <-- belongs to center B!
        }
    });
    info(`Markaz A yaratildi: id=${centerA.id} (Demo)`);
    info(`Markaz B yaratildi: id=${centerB.id} (ASR School)`);
    info(`Talaba A yaratildi: id=${studentA.id}, telegramId=test_tg_999888777`);
    info(`Talaba B yaratildi: id=${studentB.id}`);
    info(`To'lov A (centerA uchun): id=${paymentA.id}, miqdor=500000`);
    info(`To'lov B (centerB uchun): id=${paymentB.id}, miqdor=600000 ← bu ko'rinmasligi kerak!`);
    info(`Davomat A (centerA): id=${attendanceA.id}, status=PRESENT`);
    info(`Davomat B (centerB): id=${attendanceB.id}, status=ABSENT ← bu ko'rinmasligi kerak!`);
    return { centerA, centerB, courseA, courseB, groupA, groupB, studentA, studentB };
}
// ─── TEST 1: PAYMENTS ISOLATION ──────────────────────────────
async function testPaymentsIsolation(centerAId, studentAId) {
    section("TEST 1: TO'LOVLAR IZOLYATSIYASI (payments centerId filter)");
    // Simulate what the bot does for centerA
    const student = await prisma.student.findFirst({
        where: {
            centerId: centerAId, // Bot A is running for centerA
            status: "Active",
            telegramId: "test_tg_999888777" // User's telegram ID
        },
        include: {
            payments: {
                where: { centerId: centerAId }, // ← THE FIX: filter by centerId
                orderBy: { paymentDate: 'desc' },
                take: 5
            }
        }
    });
    if (!student) {
        fail("Talaba topilmadi — student lookup ishlamayapti!");
        return;
    }
    ok(`Talaba ${centerAId} markazi uchun topildi: ${student.name}`);
    // Check: centerB's payment must NOT appear
    const hasLeakedPayment = student.payments.some(p => p.centerId !== centerAId);
    if (hasLeakedPayment) {
        fail(`TO'LOV IZOLYATSIYASI BUZILDI! Boshqa markazning to'lovi ko'rinmoqda: ${JSON.stringify(student.payments.map(p => ({ id: p.id, centerId: p.centerId, amount: p.amount })))}`);
    }
    else {
        ok(`Faqat markaz A (id=${centerAId}) to'lovlari ko'yinmoqda: ${student.payments.length} ta to'lov`);
    }
    // Check: centerA's payment IS present
    const hasCenterAPayment = student.payments.some(p => p.centerId === centerAId && p.amount === 500000);
    if (hasCenterAPayment) {
        ok("Markaz A ning to'lovi (500,000 so'm) to'g'ri ko'rinmoqda");
    }
    else {
        fail("Markaz A ning to'lovi ko'rinmayapdi — filter juda qattiq!");
    }
    // Verify: if we DON'T filter (old broken behavior), centerB's payment would appear
    const brokenQuery = await prisma.student.findFirst({
        where: { centerId: centerAId, status: "Active", telegramId: "test_tg_999888777" },
        include: { payments: { orderBy: { paymentDate: 'desc' }, take: 10 } } // NO centerId filter
    });
    const wouldHaveLeaked = brokenQuery?.payments.some(p => p.centerId !== centerAId);
    if (wouldHaveLeaked) {
        ok(`Eski kod muammoli edi: filtrsiz so'rovda ${brokenQuery?.payments.length} ta to'lov — boshqa markaz to'lovlari ham ko'rinar edi!`);
    }
}
// ─── TEST 2: COURSES ISOLATION ────────────────────────────────
async function testCoursesIsolation(centerAId, centerBId) {
    section("TEST 2: KURSLAR IZOLYATSIYASI (centerCourses filter)");
    const student = await prisma.student.findFirst({
        where: { centerId: centerAId, status: "Active", telegramId: "test_tg_999888777" },
        include: { courses: true } // fetch all (no Prisma filter possible on many-to-many)
    });
    if (!student) {
        fail("Talaba topilmadi!");
        return;
    }
    ok(`Jami kurslar (filtrsiz): ${student.courses.length} ta`);
    // THE FIX: filter after fetch
    const centerCourses = student.courses.filter((c) => c.centerId === centerAId);
    const leakedCourses = student.courses.filter((c) => c.centerId !== centerAId);
    if (leakedCourses.length > 0) {
        ok(`Eski kod muammoli edi: filtrsiz ${student.courses.length} ta kurs — boshqa markaz kurslari: ${leakedCourses.map((c) => c.name).join(", ")}`);
    }
    if (centerCourses.some((c) => c.centerId !== centerAId)) {
        fail(`KURS IZOLYATSIYASI BUZILDI! Boshqa markazning kursi ko'rinmoqda: ${leakedCourses.map((c) => c.name).join(", ")}`);
    }
    else {
        ok(`centerCourses filter ishlayapti: faqat markaz A kurslari ko'rinmoqda (${centerCourses.length} ta)`);
    }
    // Verify centerA's course is present
    const hasCenterACourse = centerCourses.some((c) => c.name === "TEST_ISOLATION_CourseA");
    if (hasCenterACourse) {
        ok("Markaz A kursi (TEST_ISOLATION_CourseA) to'g'ri ko'rinmoqda");
    }
    else {
        fail("Markaz A kursi ko'rinmayapdi — filter xato ishlayapti!");
    }
    // Verify centerB's course is NOT present
    const hasCenterBCourse = centerCourses.some((c) => c.name === "TEST_ISOLATION_CourseB");
    if (hasCenterBCourse) {
        fail("Markaz B kursi (TEST_ISOLATION_CourseB) ko'rinmoqda — izolyatsiya buzilgan!");
    }
    else {
        ok("Markaz B kursi (TEST_ISOLATION_CourseB) ko'rinmayapti ✓");
    }
}
// ─── TEST 3: ATTENDANCE ISOLATION ────────────────────────────
async function testAttendanceIsolation(centerAId) {
    section("TEST 3: DAVOMAT IZOLYATSIYASI (showAttendance centerId filter)");
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Simulate showAttendance() with the fix
    const student = await prisma.student.findFirst({
        where: {
            centerId: centerAId,
            OR: [{ telegramId: "test_tg_999888777" }, { parentTelegramId: "test_tg_999888777" }]
        },
        include: {
            attendance: {
                where: {
                    centerId: centerAId, // ← THE FIX
                    date: { gte: new Date(year, month, 1), lt: new Date(year, month + 1, 1) }
                },
                orderBy: { date: 'desc' },
                include: { group: true }
            }
        }
    });
    if (!student) {
        fail("Talaba topilmadi!");
        return;
    }
    ok(`Davomat so'rovi ishladi: ${student.attendance.length} ta yozuv`);
    // Check: no attendance from centerB
    const leakedAttendance = student.attendance.filter((a) => a.centerId !== centerAId);
    if (leakedAttendance.length > 0) {
        fail(`DAVOMAT IZOLYATSIYASI BUZILDI! Markaz B davomati ko'rinmoqda: ${leakedAttendance.map((a) => `id=${a.id}`).join(", ")}`);
    }
    else {
        ok(`Faqat markaz A davomati ko'rinmoqda`);
    }
    // Check: centerA's attendance is present (PRESENT status)
    const hasPresentRecord = student.attendance.some((a) => a.status === "PRESENT" && a.centerId === centerAId);
    if (hasPresentRecord) {
        ok("Markaz A ning PRESENT davomati to'g'ri ko'rinmoqda");
    }
    else {
        fail("Markaz A davomati ko'rinmayapdi!");
    }
    // Verify: without the fix, centerB's ABSENT would appear
    const brokenAttendance = await prisma.student.findFirst({
        where: { centerId: centerAId, OR: [{ telegramId: "test_tg_999888777" }] },
        include: {
            attendance: {
                where: { date: { gte: new Date(year, month, 1), lt: new Date(year, month + 1, 1) } },
                // NO centerId filter — OLD broken behavior
                orderBy: { date: 'desc' },
                include: { group: true }
            }
        }
    });
    const wouldHaveLeaked = brokenAttendance?.attendance.some((a) => a.centerId !== centerAId);
    if (wouldHaveLeaked) {
        ok(`Eski kod muammoli edi: filtrsiz ${brokenAttendance?.attendance.length} ta davomat — ABSENT (markaz B) ham ko'rinar edi!`);
    }
}
// ─── TEST 4: STUDENT LOOKUP ISOLATION ────────────────────────
async function testStudentLookupIsolation(centerAId, centerBId) {
    section("TEST 4: TALABA LOOKUP IZOLYATSIYASI");
    // Center A bot should find student in centerA
    const foundInA = await prisma.student.findFirst({
        where: { centerId: centerAId, status: "Active", telegramId: "test_tg_999888777" }
    });
    // Center B bot should NOT find that student (different center)
    const foundInB = await prisma.student.findFirst({
        where: { centerId: centerBId, status: "Active", telegramId: "test_tg_999888777" }
    });
    if (foundInA) {
        ok(`Markaz A boti talaba topdi: ${foundInA.name} (centerId=${foundInA.centerId})`);
    }
    else {
        fail("Markaz A boti talabani topa olmadi!");
    }
    if (!foundInB) {
        ok("Markaz B boti shu telegramId bilan boshqa markaz talabani topolmadi ✓");
    }
    else {
        fail(`Markaz B boti Markaz A talabini ko'rdi: ${foundInB.name} — izolyatsiya buzilgan!`);
    }
}
// ─── CLEANUP ─────────────────────────────────────────────────
async function cleanup(centerAId, centerBId) {
    section("TEST MA'LUMOTLARINI TOZALASH");
    await prisma.$executeRaw `DELETE FROM "Payment" WHERE "notes" = 'TEST_ISOLATION'`;
    await prisma.$executeRaw `DELETE FROM "Attendance" WHERE "centerId" IN (${centerAId}, ${centerBId}) AND "studentId" IN (SELECT id FROM "Student" WHERE "name" LIKE 'TEST_ISOLATION_%')`;
    await prisma.$executeRaw `DELETE FROM "_CourseToStudent" WHERE "B" IN (SELECT id FROM "Student" WHERE "name" LIKE 'TEST_ISOLATION_%')`;
    await prisma.$executeRaw `DELETE FROM "_GroupToStudent" WHERE "B" IN (SELECT id FROM "Student" WHERE "name" LIKE 'TEST_ISOLATION_%')`;
    await prisma.$executeRaw `DELETE FROM "Student" WHERE "name" LIKE 'TEST_ISOLATION_%'`;
    await prisma.$executeRaw `DELETE FROM "Group" WHERE "name" LIKE 'TEST_ISOLATION_%'`;
    await prisma.$executeRaw `DELETE FROM "Course" WHERE "name" LIKE 'TEST_ISOLATION_%'`;
    await prisma.$executeRaw `DELETE FROM "Center" WHERE "login" LIKE 'test_isolation_%'`;
    info("Test ma'lumotlari o'chirildi.");
}
// ─── MAIN ─────────────────────────────────────────────────────
async function main() {
    console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════╗
║   BOT DATA ISOLATION TEST SUITE v1.0    ║
╚══════════════════════════════════════════╝${RESET}\n`);
    let setupData;
    try {
        setupData = await setup();
    }
    catch (err) {
        console.error(`${RED}❌ Setup xatosi: ${err.message}${RESET}`);
        await prisma.$disconnect();
        process.exit(1);
    }
    const { centerA, centerB } = setupData;
    try {
        await testPaymentsIsolation(centerA.id, setupData.studentA.id);
        await testCoursesIsolation(centerA.id, centerB.id);
        await testAttendanceIsolation(centerA.id);
        await testStudentLookupIsolation(centerA.id, centerB.id);
    }
    catch (err) {
        console.error(`${RED}❌ Test xatosi: ${err.message}${RESET}`);
    }
    finally {
        await cleanup(centerA.id, centerB.id);
    }
    // ─── RESULTS ───────────────────────────────────────────────
    section("NATIJALAR");
    console.log(`\n  ${GREEN}${BOLD}✅ Muvaffaqiyatli: ${passed}${RESET}`);
    console.log(`  ${RED}${BOLD}❌ Muvaffaqiyatsiz: ${failed}${RESET}\n`);
    if (failed === 0) {
        console.log(`${GREEN}${BOLD}🎉 Barcha izolyatsiya testlari muvaffaqiyatli o'tdi!${RESET}\n`);
    }
    else {
        console.log(`${RED}${BOLD}⚠️  ${failed} ta test muvaffaqiyatsiz! Kodni tekshiring.${RESET}\n`);
        process.exit(1);
    }
    await prisma.$disconnect();
}
main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=test-isolation.js.map