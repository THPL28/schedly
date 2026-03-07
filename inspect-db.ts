import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    console.log('Testing connection...')
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, slug: true },
            take: 5
        })
        console.log('Connection successful!')
        console.log('Users found:', users.length)
        console.log(JSON.stringify(users, null, 2))
    } catch (error: any) {
        console.error('DATABASE CONNECTION ERROR:')
        console.error(error.message)
        if (error.code) console.error('Error Code:', error.code)
    }
}
main().catch(console.error).finally(() => prisma.$disconnect())
