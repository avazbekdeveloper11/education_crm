"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
    console.log('Center created:', center);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map