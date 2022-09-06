import { createRouter } from './context'
import { Collectable } from '@prisma/client'

export const collectableRouter = createRouter().query('random', {
    async resolve({ ctx }) {
        const result: Collectable | null = await ctx.prisma
            .$queryRaw`SELECT * FROM collectables ORDER BY random() LIMIT 1;`
        return result
    },
})
