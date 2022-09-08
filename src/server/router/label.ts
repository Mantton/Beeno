import { createRouter } from './context'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
export const labelRouter = createRouter()
    .query('get', {
        resolve: async ({ ctx }) => {
            return ctx.prisma.label.findMany({
                include: {
                    bannerImage: true,
                    logoImage: true,
                },
            })
        },
    })
    .query('unique', {
        input: z.string(),
        resolve: ({ ctx, input }) => {
            return ctx.prisma.label.findUnique({
                where: {
                    id: input,
                },
                include: {
                    bannerImage: true,
                    logoImage: true,
                },
            })
        },
    })
    .query('get.groups', {
        input: z.string(),
        resolve: ({ ctx, input }) => {
            return ctx.prisma.group.findMany({
                where: {
                    labelId: input,
                },
                include: {
                    bannerImage: true,
                    logoImage: true,
                },
            })
        },
    })
    .mutation('update', {
        input: z.object({
            id: z.string(),
            name: z.union([z.string(), z.undefined()]),
            bannerImageId: z.union([z.string(), z.undefined()]),
            logoImageId: z.union([z.string(), z.undefined()]),
        }),
        resolve: async ({ ctx, input }) => {
            // Auth
            if (!ctx.session || !ctx.session.user)
                throw new TRPCError({ code: 'UNAUTHORIZED' })

            // Has Permission
            const roles = ctx.session.user.roles?.map((v) => v.roleId) ?? []
            if (!roles.some((v) => [1, 2, 3].includes(v)))
                throw new TRPCError({ code: 'FORBIDDEN' })
            return ctx.prisma.label.update({
                where: {
                    id: input.id,
                },
                data: { ...input },
            })
        },
    })
    .mutation('create', {
        input: z.object({
            name: z.string(),
            bannerImageId: z.union([z.string(), z.undefined()]),
            logoImageId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            // Auth
            if (!ctx.session || !ctx.session.user)
                throw new TRPCError({ code: 'UNAUTHORIZED' })

            // Has Permission
            const roles = ctx.session.user.roles?.map((v) => v.roleId) ?? []
            if (!roles.some((v) => [1, 2, 3].includes(v)))
                throw new TRPCError({ code: 'FORBIDDEN' })
            return await ctx.prisma.label.create({
                data: {
                    name: input.name,
                    bannerImageId: input.bannerImageId,
                    logoImageId: input.logoImageId,
                },
            })
        },
    })
