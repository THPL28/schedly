
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const whitelist = [
    'tiago.looze28@gmail.com',
    'thpldevweb@gmail.com',
    'flahwagner19@gmail.com'
];

async function main() {
    console.log('Starting migration to set ADMIN roles and update subscriptions...');

    for (const email of whitelist) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true }
        });

        if (user) {
            console.log(`Processing ${email}...`);

            // Set role to ADMIN
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log(`- Set role to ADMIN for ${email}`);

            // Ensure they have an ACTIVE subscription or a very long TRIAL
            if (user.subscription) {
                await prisma.subscription.update({
                    where: { userId: user.id },
                    data: {
                        status: 'ACTIVE',
                        trialEndDate: null
                    }
                });
                console.log(`- Updated subscription to ACTIVE for ${email}`);
            } else {
                await prisma.subscription.create({
                    data: {
                        userId: user.id,
                        status: 'ACTIVE',
                        startDate: new Date()
                    }
                });
                console.log(`- Created ACTIVE subscription for ${email}`);
            }
        } else {
            console.log(`User ${email} not found in database.`);
        }
    }

    console.log('Migration finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
