import { createRouter } from './context'
import { z } from 'zod'
import { createProtectedRouter } from './protected-router'
import { resolve } from 'path'

export const collectorRouter = createRouter().query('get', {
    input: z.string(),
    async resolve({ ctx, input }) {
        return await ctx.prisma.user.findUnique({
            where: {
                id: input,
            },
            select: {
                id: true,
                image: true,
                name: true,
                cards: true,
                handle: true,
                bannerImage: true,
            },
        })
    },
})

export const protectedCollectorRouter = createProtectedRouter().mutation(
    'rename',
    {
        input: z.object({
            name: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            // TODO: Validation?
            return ctx.prisma.user.update({
                where: {
                    id: ctx.session.user.id,
                },
                data: {
                    name: input.name,
                },
            })
        },
    }
)
