import { UserRole } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user?: {
            id: string
            name: string
            image: string
            handle: string
            roles?: UserRole[]
        } & DefaultSession['user']
    }
}
