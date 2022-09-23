import { createRouter } from './context'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { isPaladin } from '../../utils/permissions'

export const groupRouter = createRouter()
    .mutation('create', {
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
    .query('info', {
        input: z.string(),
        resolve: ({ ctx, input }) => {
            return ctx.prisma.group.findUnique({
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
    .mutation('members.create', {
        input: z.object({
            groupId: z.string(),
            labelId: z.string(),
            englishName: z.string(),
            hangulName: z.union([z.string(), z.undefined()]),
            bannerImageId: z.union([z.string(), z.undefined()]),
            avatarImageId: z.union([z.string(), z.undefined()]),
        }),
        resolve: async ({ ctx, input }) => {
            // Auth
            if (!ctx.session || !ctx.session.user)
                throw new TRPCError({ code: 'UNAUTHORIZED' })

            // Has Permission
            const roles = ctx.session.user.roles ?? []
            if (!isPaladin(roles)) throw new TRPCError({ code: 'FORBIDDEN' })

            const existingCount = (
                await ctx.prisma.artist.aggregate({
                    where: {
                        labelId: input.groupId,
                        englishName: input.englishName,
                    },
                    _count: true,
                })
            )._count

            if (existingCount >= 1) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Artist Already Exists',
                })
            }

            return ctx.prisma.$transaction(async (db) => {
                const artist = await db.artist.create({
                    data: {
                        englishName: input.englishName,
                        hangulName: input.hangulName,
                        bannerImageId: input.bannerImageId,
                        avatarImageId: input.avatarImageId,
                        labelId: input.labelId,
                    },
                })

                return db.groupMember.create({
                    data: {
                        groupId: input.groupId,
                        artistId: artist.id,
                    },
                    include: {
                        artist: {
                            include: {
                                banner: true,
                                avatar: true,
                            },
                        },
                    },
                })
            })
        },
    })
    .query('members.get', {
        input: z.string(),
        resolve: ({ ctx, input }) => {
            return ctx.prisma.groupMember.findMany({
                where: {
                    groupId: input,
                },
                include: {
                    artist: {
                        include: {
                            avatar: true,
                        },
                    },
                },
            })
        },
    })
