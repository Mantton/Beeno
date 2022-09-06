import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../server/db/client'

const adapter = PrismaAdapter(prisma)
adapter.createUser = async (data) => {
    const name = (data.name as string | undefined) ?? ''
    const user = await prisma.user.create({
        data: { ...data, name },
        include: {
            roles: true,
        },
    })
    const userCount = await prisma.user.count()
    if (userCount <= 1) {
        // First User, Give SuperUser role
        const role = await prisma.role.findUnique({
            where: {
                title: 'Administrator',
            },
        })

        if (role) {
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: role.id,
                },
            })
        }
    }
    return user
}
adapter.getUser = (id: string) => {
    return prisma.user.findUnique({ where: { id }, include: { roles: true } })
}

adapter.getSessionAndUser = async (sessionToken) => {
    const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
            user: {
                include: {
                    roles: true,
                },
            },
        },
    })
    if (!userAndSession) return null
    const { user, ...session } = userAndSession
    return { user, session }
}

export default adapter
