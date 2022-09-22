import { Role, UserRole } from '@prisma/client'

export const PERMISSIONS = [
    {
        id: Role.ADMIN,
        title: 'Administrator',
        description: 'Has all permissions, can grant other users roles.',
        colorCode: '003049',
    },
    {
        id: Role.SENTINEL,
        title: 'Sentinel',
        description: 'Can Edit & Create Cards and Eras',
        colorCode: 'd62828',
    },
    {
        id: Role.PALADIN,
        title: 'Paladin',
        description: 'Can Create & Edit Companies, Groups & Artists',
        colorCode: 'e29578',
    },
]

export const isPaladin = (roles: UserRole[]): boolean => {
    const valid = [Role.ADMIN, Role.PALADIN, Role.SENTINEL]

    return roles.some((v) => valid.includes(v.role))
}

export const isSentinel = (roles: UserRole[]): boolean => {
    const valid: Role[] = [Role.ADMIN, Role.SENTINEL]

    return roles.some((v) => valid.includes(v.role))
}
