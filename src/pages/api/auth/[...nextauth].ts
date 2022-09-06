import { UserRole } from '@prisma/client'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

import { env } from '../../../env/server.mjs'
import adapter from '../../../utils/adapter'

export const authOptions: NextAuthOptions = {
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                session.user.handle = user.handle as string
                session.user.name = user.name ?? ''
                session.user.roles = user.roles as UserRole[]
            }
            return session
        },
    },
    adapter,
    providers: [
        TwitterProvider({
            clientId: env.TWITTER_CLIENT_ID,
            clientSecret: env.TWITTER_CLIENT_SECRET,
            version: '2.0',
        }),
    ],
}

export default NextAuth(authOptions)
