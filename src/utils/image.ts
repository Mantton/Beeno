import { Image } from '@prisma/client'

const getBaseUrl = () => {
    if (typeof window !== 'undefined') return '' // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}
const upload = async (file: File, isBanner = true): Promise<Image> => {
    const form = new FormData()
    form.append('file', file)
    const response = await (
        await fetch(
            `${getBaseUrl()}/api/assets/upload?type=${
                isBanner ? 'banner' : 'avatar'
            }`,
            {
                credentials: 'include',
                method: 'POST',
                body: form,
            }
        )
    ).json()
    return response.data
}

export default upload
