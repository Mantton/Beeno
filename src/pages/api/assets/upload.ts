import { NextApiRequest, NextApiResponse } from 'next'
import { getServerAuthSession } from '../../../server/common/get-server-auth-session'
import formidable from 'formidable'
import * as fs from 'fs'
import { Storage } from '@google-cloud/storage'
import { env } from '../../../env/server.mjs'
import { v4 as uuidv4 } from 'uuid'

export const config = {
    api: {
        bodyParser: false,
    },
}

const upload = async (req: NextApiRequest, res: NextApiResponse) => {
    if (!(req.method == 'POST')) {
        return res.status(400).send({ msg: 'Invalid Method' })
    }
    const session = await getServerAuthSession({ req, res })

    if (!session?.user) return res.status(401).send({ msg: 'Unauthorized' })
    const user = session.user
    const form = new formidable.IncomingForm()

    form.parse(req, async (err, fields, files) => {
        const obj = files.file
        if (!obj) {
            res.status(400).send({ msg: 'No File' })
            return
        }

        const file = Array.isArray(obj) ? obj[0] : obj
        if (!file) {
            res.status(400).send({ msg: 'No File' })
            return
        }
        const { buffer } = fs.readFileSync(file.filepath)

        try {
            const imageUrl = await uploadImage(buffer)
            const image = await createImageRecord(imageUrl, user.id)
            res.send({
                data: image,
            })
        } catch (error: unknown) {
            console.log(error)
            res.status(500).send({
                msg: 'error',
            })
        }
    })

    // TODO: Authorization, Rate Limit
}

const uploadImage = async (buffer: ArrayBufferLike): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        const storage = new Storage({
            projectId: env.GCS_PROJECT_ID,
            credentials: {
                private_key: env.GCS_PRIVATE_KEY,
                client_email: env.GCS_CLIENT_EMAIL,
            },
        })

        const bucket = storage.bucket(env.GCS_BUCKET)
        const fileName = `${uuidv4()}.png`
        const blob = bucket.file(fileName)
        const blobStream = blob.createWriteStream({
            resumable: false,
        })
        blobStream
            .on('finish', () => {
                const publicUrl = `${env.CDN_DOMAIN}/${blob.name}`
                resolve(publicUrl)
            })
            .on('error', (err) => {
                reject(err)
            })
            .end(Buffer.from(new Uint8Array(buffer)))
    })

const createImageRecord = async (url: string, uploaderId: string) => {
    return prisma?.image.create({
        data: {
            url,
            uploaderId,
        },
    })
}
export default upload
