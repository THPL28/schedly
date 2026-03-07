
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const whitelist = [
    'tiago.looze28@gmail.com',
    'thpldevweb@gmail.com',
    'flahwagner19@gmail.com'
];

async function main() {
    console.log('Verifying user roles and subscriptions...');

    for (const email of whitelist) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true }
        });

        if (user) {
            console.log(`User: ${email}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Subscription Status: ${user.subscription?.status || 'NONE'}`);
        } else {
            console.log(`User ${email} NOT FOUND.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
