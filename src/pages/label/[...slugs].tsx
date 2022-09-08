import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { trpc } from '../../utils/trpc'
import { Label, Image as PImage, Group } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { IUseState } from '../../types/react'
import { Modal } from '../../components/modal/modal'
import { BiCamera, BiX } from 'react-icons/bi'
import { SubmitHandler, useForm } from 'react-hook-form'
import upload from '../../utils/image'
import slug from '../../utils/slug'
import { useRouter } from 'next/router'

const LabelPage: NextPage = () => {
    const router = useRouter()
    const id = router.query.slugs?.[0] ?? ''
    const queryResult = trpc.useQuery(['label.unique', id])

    return (
        <>
            <Head>
                <title>
                    {queryResult.data ? queryResult.data.name : 'Label'}
                </title>
                <meta
                    name="description"
                    content="K-pop Digital Card Trading Platform"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={clsx('h-screen')}>
                {queryResult.isLoading && (
                    <>
                        <div className="flex justify-center items-center">
                            {' '}
                            <span>Loading...</span>
                        </div>
                    </>
                )}
                {queryResult.error && (
                    <>
                        <div>Error</div>
                    </>
                )}

                {queryResult.data && <Core label={queryResult.data}></Core>}
            </main>
        </>
    )
}

const Core: React.FC<{
    label: Label & {
        bannerImage: PImage | null
        logoImage: PImage
    }
}> = ({ label }) => {
    const session = useSession()
    const [section, setSection] = useState(0)
    const canEdit = (session.data?.user?.roles ?? [])
        .map((v) => v.roleId)
        .some((v) => v <= 3)
    return (
        <div className="h-full">
            <div
                style={
                    {
                        backgroundImage:
                            label.bannerImage?.url &&
                            `url(${label.bannerImage.url})`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                    } as React.CSSProperties
                }
                className="relative h-1/4 w-full bg-neutral-800"
            >
                <div className="h-[120px] w-[120px] rounded-full absolute -bottom-12 border-8 border-white mx-6">
                    <Image
                        src={label.logoImage.url}
                        alt="logo image"
                        height={120}
                        width={120}
                        className="rounded-full"
                    />
                </div>
            </div>
            <div className="mx-6 mt-16 mb-4 flex justify-between">
                <h1 className="text-3xl font-bold antialiased">{label.name}</h1>
                {canEdit && <AddModal labelId={label.id} />}
            </div>
            <div className="border-b-2 border-neutral-400/40 mx-6">
                <div className="flex gap-6">
                    <button onClick={() => setSection(0)}>
                        <span
                            className={clsx(
                                'w-20 py-2 border-b-4 flex justify-center',
                                section == 0
                                    ? ' border-black'
                                    : 'border-transparent'
                            )}
                        >
                            Groups
                        </span>
                    </button>
                    <button onClick={() => setSection(1)}>
                        <span
                            className={clsx(
                                'w-20 py-2 border-b-4 flex justify-center',
                                section == 1
                                    ? ' border-black'
                                    : 'border-transparent'
                            )}
                        >
                            Artists
                        </span>
                    </button>
                </div>
            </div>
            <div className="m-6">
                {section == 0 ? (
                    <GroupSection id={label.id} />
                ) : (
                    <ArtistSection id={label.id} />
                )}
            </div>
        </div>
    )
}

const GroupSection: React.FC<{ id: string }> = ({ id }) => {
    const result = trpc.useQuery(['label.get.groups', id])

    if (result.isLoading) {
        return (
            <div>
                <span>Loading</span>
            </div>
        )
    }

    if (result.error) {
        return (
            <div>
                <span> Error</span>
            </div>
        )
    }

    if (!result.data) {
        return <div>No Data</div>
    }

    return (
        <>
            <div className="grid grid-cols-3 content-center gap-4">
                {result.data.map((v) => {
                    return (
                        <div key={v.id}>
                            <GroupCard {...v} />
                        </div>
                    )
                })}
            </div>
        </>
    )
}

const GroupCard: React.FC<
    Group & {
        bannerImage: PImage | null
        logoImage: PImage | null
    }
> = ({ bannerImage, englishName, logoImage, id }) => {
    return (
        <>
            <a
                href={`/group/${id}/${slug(englishName)}`}
                className="hover:shadow-lg hover:shadow-neutral-900"
            >
                <div
                    style={
                        {
                            backgroundImage:
                                bannerImage?.url && `url(${bannerImage.url})`,
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                        } as React.CSSProperties
                    }
                    className="w-full bg-neutral-800 h-40 text-white rounded-lg"
                >
                    <div className="w-full h-full bg-gradient-to-b from-transparent to-neutral-900 rounded-lg">
                        <div className="flex h-full gap-4 items-end p-2">
                            <div className="flex items-center gap-4">
                                <div className="h-50 w-50 rounded-full">
                                    {logoImage?.url && (
                                        <Image
                                            src={logoImage.url}
                                            width={50}
                                            height={50}
                                            alt="logo image"
                                            className="rounded-full"
                                        />
                                    )}
                                </div>
                                <span className="font-bold text-xl">
                                    {englishName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </>
    )
}

const ArtistSection: React.FC<{ id: string }> = ({}) => {
    return (
        <>
            <span>Artist Sections</span>
        </>
    )
}
const AddModal: React.FC<{ labelId: string }> = ({ labelId }) => {
    const [present, setPresent] = useState(false)
    return (
        <>
            <button
                onClick={() => setPresent(true)}
                style={
                    {
                        borderWidth: '1.75px',
                    } as React.CSSProperties
                }
                className="h-7 font-medium text-xs px-2 border-neutral-800 rounded-3xl hover:text-white hover:bg-neutral-800 transition-colors hover:border-neutral-500"
            >
                Add Group
            </button>
            <Modal
                isOpen={present}
                setIsOpen={setPresent}
                className="absolute w-2/3 bg-neutral-900 text-white rounded-md "
            >
                <ModalContent setModal={setPresent} labelId={labelId} />
            </Modal>
        </>
    )
}

type ModalProps = {
    setModal: IUseState<boolean>
    labelId: string
}
type Values = {
    englishName: string
    hangulName?: string
    submit?: string
}
const ModalContent: React.FC<ModalProps> = ({ setModal, labelId }) => {
    const { register, handleSubmit, setError } = useForm<Values>()
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const mutator = trpc.useMutation(['group.create'])

    const setImageForElement = (id: string, file: File) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const result = event.target?.result
            const element = document.getElementById(id) as HTMLDivElement | null
            if (element && result && typeof result === 'string') {
                element.style.backgroundImage = `url(${result})`
            }
        }
    }
    const onFileChanged = (
        e: React.ChangeEvent<HTMLInputElement>,
        setState: IUseState<File | null>
    ) => {
        //
        const files = e.target.files
        const file = files?.[0] ?? null
        if (!file) return
        const sizeInMB = file.size / (1024 * 1024)
        if (sizeInMB > 3) {
            // TODO: Set Error, File too large
            return
        }
        setState(file)
    }
    useEffect(() => {
        if (logoFile) setImageForElement('logo-image', logoFile)
        if (bannerFile) setImageForElement('banner-image', bannerFile)
    }, [logoFile, bannerFile])
    const onSubmit: SubmitHandler<Values> = async ({
        englishName,
        hangulName,
    }) => {
        try {
            let savedLogoImage: PImage | undefined
            let savedBannerImage: PImage | undefined
            if (logoFile) {
                savedLogoImage = await upload(logoFile, false)
            }
            if (bannerFile) {
                savedBannerImage = await upload(bannerFile)
            }
            if (!savedLogoImage) {
                throw 'Logo Not Created'
            }
            await mutator.mutateAsync({
                englishName,
                hangulName,
                logoImageId: savedLogoImage.id,
                bannerImageId: savedBannerImage?.id,
                labelId,
            })
        } catch (error: unknown) {
            console.log(error)
            setError('submit', { message: (error as Error).message })
        }

        setModal(false)
    }

    return (
        <>
            <div className="flex-col">
                <div className="flex justify-between items-center px-4 my-2">
                    <div className="flex gap-4 items-center">
                        <button onClick={() => setModal(false)}>
                            <BiX size={'1.7rem'} />
                        </button>
                        <span className="font-medium">Add Group</span>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                    <div className="flex flex-col gap-4 mx-8 mb-8 mt-2">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-white text-sm font-bold mb-2"
                            >
                                English Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                {...register('englishName')}
                                placeholder={'English Name'}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-neutral-900 border-1 border-white/30 leading-tight focus:outline-none focus:shadow-outline focus:border-white/50"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-white text-sm font-bold mb-2"
                            >
                                Hangul Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                {...register('hangulName')}
                                placeholder={'Hangul Name'}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-neutral-900 border-1 border-white/30 leading-tight focus:outline-none focus:shadow-outline focus:border-white/50"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="logo-input"
                                className="block text-white text-sm font-bold mb-2"
                            >
                                Logo Image
                            </label>
                            <div
                                id="logo-image"
                                style={
                                    {
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                    } as React.CSSProperties
                                }
                                className={clsx(
                                    'flex items-center justify-center',
                                    'h-[120px] w-[120px]',
                                    'rounded-sm',
                                    'border-2 border-white/20'
                                )}
                            >
                                <div className="flex items-center justify-center">
                                    <label
                                        htmlFor="logo-input"
                                        className="bg-neutral-500/80 p-2 rounded-full  cursor-pointer "
                                    >
                                        <BiCamera
                                            size={'1.5rem'}
                                            strokeWidth={'0.1'}
                                            className="text-white/70"
                                        />
                                        <input
                                            id="logo-input"
                                            type="file"
                                            hidden
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={(e) =>
                                                onFileChanged(e, setLogoFile)
                                            }
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-white text-sm font-bold mb-2"
                            >
                                Banner Image
                            </label>
                            <div
                                id="banner-image"
                                style={
                                    {
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                    } as React.CSSProperties
                                }
                                className={clsx(
                                    'flex items-center justify-center',
                                    'h-[120px] w-[240px]',
                                    'rounded-sm',
                                    'border-2 border-white/20'
                                )}
                            >
                                <div className="flex items-center justify-center">
                                    <label
                                        htmlFor="banner-input"
                                        className="bg-neutral-500/80 p-2 rounded-full  cursor-pointer "
                                    >
                                        <BiCamera
                                            size={'1.5rem'}
                                            strokeWidth={'0.1'}
                                            className="text-white/70"
                                        />
                                        <input
                                            id="banner-input"
                                            type="file"
                                            hidden
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={(e) =>
                                                onFileChanged(e, setBannerFile)
                                            }
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-1 bg-white text-neutral-900 rounded-xl"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default LabelPage
