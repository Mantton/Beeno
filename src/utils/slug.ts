import slugify from 'slugify'

const slug = (str: string) => {
    return slugify(str, {
        lower: true,
        trim: true,
    })
}

export default slug
