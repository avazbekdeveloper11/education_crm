import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const center = await prisma.center.upsert({
    where: { login: 'demo' },
    update: {},
    create: {
      name: 'Demo O\'quv Markazi',
      login: 'demo',
      password: 'password123',
      status: 'Active',
    },
  });
  console.log('Center created:', center.name);

  // 1. Create Courses
  const coursesData = [
    { name: 'Matematika', price: 400000, duration: 6, description: 'Boshlang\'ich va yuqori daraja uchun matematika' },
    { name: 'Ingliz tili (General)', price: 350000, duration: 8, description: 'Elementary to Upper-Intermediate' },
    { name: 'IELTS Preparation', price: 500000, duration: 3, description: 'Intensive IELTS course' },
    { name: 'Ona tili', price: 300000, duration: 9, description: 'DTM testlariga tayyorgarlik' },
    { name: 'Kimyo', price: 400000, duration: 10, description: 'Nazariya va amaliyot' },
  ];

  const courses = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({
      data: { ...c, centerId: center.id },
    });
    courses.push(course);
  }
  console.log('Courses created:', courses.length);

  // 2. Create Groups
  const groups = [];
  const days = ['Dush-Chor-Jum', 'Sesh-Pay-Shan'];
  const times = ['14:00', '16:00', '18:00'];
  const teachers = ['Aliyev Anvar', 'Karimova Gulnoza', 'Toshmatov Bobur', 'Sodiqova Malika'];

  for (const [index, course] of courses.entries()) {
    for (let i = 1; i <= 2; i++) {
      const group = await prisma.group.create({
        data: {
          name: `${course.name} Group #${i}`,
          teacher: teachers[Math.floor(Math.random() * teachers.length)],
          days: days[i % 2],
          time: times[index % times.length],
          centerId: center.id,
          courseId: course.id,
        },
      });
      groups.push(group);
    }
  }
  console.log('Groups created:', groups.length);

  // 3. Create Students
  const students = [];
  const firstNames = ['Azamat', 'Dilshod', 'Eldor', 'Farrux', 'Guli', 'Hulkar', 'Iroda', 'Jasur', 'Komil', 'Lola', 'Mirali', 'Nigora', 'Olim', 'Pulat', 'Qobil', 'Rustam', 'Siroj', 'Temur', 'Umid', 'Vali'];
  const lastNames = ['Karimov', 'Tursunov', 'Rakhimov', 'Azizov', 'Usmanov', 'Ismoilov', 'Saidov', 'Nabiev', 'Ergashev', 'Mamadiyorov'];

  for (let i = 0; i < 40; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const student = await prisma.student.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone: `+99890${Math.floor(1000000 + Math.random() * 8999999)}`,
        address: 'Toshkent sh., Yunusobod tumani',
        centerId: center.id,
        status: 'Active',
      },
    });
    students.push(student);
  }
  console.log('Students created:', students.length);

  // 4. Enroll Students into Groups & Courses
  for (const student of students) {
    const randomGroup = groups[Math.floor(Math.random() * groups.length)];
    await prisma.student.update({
      where: { id: student.id },
      data: {
        groups: { connect: { id: randomGroup.id } },
        courses: { connect: { id: randomGroup.courseId } },
      },
    });
  }
  console.log('Students enrolled into groups');

  // 5. Create Payments
  for (const student of students) {
    const studentWithCourses = await prisma.student.findUnique({
      where: { id: student.id },
      include: { courses: true },
    });

    if (studentWithCourses && studentWithCourses.courses.length > 0) {
      const course = studentWithCourses.courses[0];
      // Create 1-2 payments for each student
      const payCount = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < payCount; j++) {
        await prisma.payment.create({
          data: {
            amount: course.price,
            studentId: student.id,
            courseId: course.id,
            centerId: center.id,
            paymentType: Math.random() > 0.5 ? 'CASH' : 'CARD',
            paymentDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            notes: 'Test to\'lov',
          },
        });
      }
    }
  }
  console.log('Payments created');

  // 6. Create Leads
  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    await prisma.lead.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone: `+99893${Math.floor(1000000 + Math.random() * 8999999)}`,
        source: ['Instagram', 'Telegram', 'Facebook', 'Wall'][Math.floor(Math.random() * 4)],
        status: ['New', 'Contacted', 'Trial'][Math.floor(Math.random() * 3)],
        centerId: center.id,
        courseId: courses[Math.floor(Math.random() * courses.length)].id,
      },
    });
  }
  console.log('Leads created');

  // 7. Create Attendance (for yesterday and today)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const today = new Date();

  for (const group of groups) {
    const groupWithStudents = await prisma.group.findUnique({
      where: { id: group.id },
      include: { students: true },
    });

    if (groupWithStudents) {
      for (const student of groupWithStudents.students) {
        // Attendance for yesterday
        await prisma.attendance.create({
          data: {
            date: yesterday,
            status: Math.random() > 0.2 ? 'PRESENT' : 'ABSENT',
            studentId: student.id,
            groupId: group.id,
            centerId: center.id,
          },
        });
        // Attendance for today
        await prisma.attendance.create({
          data: {
            date: today,
            status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
            studentId: student.id,
            groupId: group.id,
            centerId: center.id,
          },
        });
      }
    }
  }
  console.log('Attendance records created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
