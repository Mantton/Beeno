import { createRouter } from './context'
import { z } from 'zod'

export const artistRouter = createRouter().query('get', {
    input: z.object({
        id: z.string(),
    }),
    resolve({ ctx, input }) {
        return ctx.prisma.artist.findUnique({
            where: {
                id: input?.id,
            },
        })
    },
})
