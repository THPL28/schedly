import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'tiago'; // Assuming this is the test slug or any slug
    const user = await prisma.user.findFirst({
        where: { slug: { not: null } },
        include: { eventTypes: true, subscription: { include: { plan: true } } }
    });

    if (!user) {
        console.log('No user with slug found');
        return;
    }

    console.log('User:', {
        id: user.id,
        name: user.name,
        slug: user.slug,
        role: user.role
    });

    console.log('Subscription:', user.subscription ? {
        status: user.subscription.status,
        plan: user.subscription.plan?.name,
        trialEndDate: user.subscription.trialEndDate
    } : 'None');

    console.log('EventTypes:', user.eventTypes.map(et => ({
        id: et.id,
        name: et.name,
        slug: et.slug,
        isActive: et.isActive
    })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
