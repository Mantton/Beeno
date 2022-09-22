import { createRouter } from './context'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { isPaladin } from '../../utils/permissions'

export const groupRouter = createRouter().mutation('create', {
    input: z.object({
        englishName: z.string(),
        hangulName: z.union([z.string(), z.undefined()]),
        logoImageId: z.string(),
        bannerImageId: z.union([z.string(), z.undefined()]),
        labelId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
        // Auth
        if (!ctx.session || !ctx.session.user)
            throw new TRPCError({ code: 'UNAUTHORIZED' })

        // Has Permission
        const roles = ctx.session.user.roles ?? []
        if (!isPaladin(roles)) throw new TRPCError({ code: 'FORBIDDEN' })

        const found = await ctx.prisma.group.findUnique({
            where: {
                labelId_englishName: {
                    labelId: input.labelId,
                    englishName: input.englishName,
                },
            },
        })
        if (found) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Group Already Exists',
            })
        }
        return await ctx.prisma.group.create({
            data: {
                englishName: input.englishName,
                hangulName: input.hangulName,
                labelId: input.labelId,
                logoImageId: input.logoImageId,
                bannerImageId: input.bannerImageId,
            },
        })
    },
})
