import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const basic = await prisma.plan.upsert({
        where: { name: 'Basic' },
        update: {},
        create: {
            name: 'Basic',
            price: 29.90,
            features: JSON.stringify(['Unlimited appointments', 'Email reminders', 'Basic reports']),
        },
    })

    const pro = await prisma.plan.upsert({
        where: { name: 'Pro' },
        update: {},
        create: {
            name: 'Pro',
            price: 49.90,
            features: JSON.stringify(['Everything in Basic', 'Advanced reports', 'Custom branding', 'Priority support']),
        },
    })

    console.log({ basic, pro })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
