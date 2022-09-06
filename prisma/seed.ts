import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const data: Prisma.RoleCreateInput[] = [
    {
        title: 'Administrator',
        description: 'Has all permissions, can grant other users roles.',
        colorCode: '003049',
    },
    {
        title: 'Sentinel',
        description: 'Can Edit & Create Cards and Eras',
        colorCode: 'd62828',
    },
    {
        title: 'Paladin',
        description: 'Can Create & Edit Companies, Groups & Artists',
        colorCode: 'e29578',
    },
]

async function main() {
    console.log(`Start seeding ...`)
    // Roles
    prisma.role.createMany({ data })
    console.log(`Seeding finished.`)
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
