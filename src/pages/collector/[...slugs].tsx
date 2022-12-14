import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { trpc } from '../../utils/trpc'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { BiCamera, BiX } from 'react-icons/bi'
import { Modal } from '../../components/modal/modal'
import { clsx } from 'clsx'
import { SubmitHandler, useForm } from 'react-hook-form'
import { IUseState } from '../../types/react'
import upload from '../../utils/image'

type FormValues = {
    name?: string
    banner?: FileList
    avatar?: FileList
    submit?: string
}
const CollectorPage: NextPage = () => {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const id = router.query.slugs?.[0]
    const session = useSession()
    const result = trpc.useQuery(['collector.get', id ?? ''])
    const { register, handleSubmit, setError } = useForm<FormValues>()
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const avatarMutator = trpc.useMutation(['image.avatar'])
    const bannerMutator = trpc.useMutation(['image.banner'])
    const nameMutator = trpc.useMutation(['protectedCollector.rename'])
    useEffect(() => {
        // Handle Modal State change
        if (!isOpen) {
            setAvatarFile(null)
            setBannerFile(null)
        }
        // Update Avatar File
        if (avatarFile) {
            const reader = new FileReader()
            reader.readAsDataURL(avatarFile)
            reader.onload = (event) => {
                const result = event.target?.result
                const element = document.getElementById(
                    'avatar-image'
                ) as HTMLDivElement | null
                if (element && result && typeof result === 'string') {
                    element.style.backgroundImage = `url(${result})`
                }
            }
        }

        //  Update Banner File
        if (bannerFile) {
            const reader = new FileReader()
            reader.readAsDataURL(bannerFile)
            reader.onload = (event) => {
                const result = event.target?.result
                const element = document.getElementById(
                    'banner-image'
                ) as HTMLDivElement | null
                if (element && result && typeof result === 'string') {
                    element.style.backgroundImage = `url(${result})`
                }
            }
        }
    }, [avatarFile, bannerFile, isOpen])
    if (!id) {
        return <div>How?</div>
    }
    if (result.isLoading) {
        return <div>Loading</div>
    }

    if (result.isError && result.error) {
        return <div>Encountered an error {result.error.message}</div>
    }
    const account = result.data

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            // Upload Images
            if (avatarFile) {
                const image = await upload(avatarFile, false)
                await avatarMutator.mutateAsync(image.url)
            }
            if (bannerFile) {
                const image = await upload(bannerFile)
                await bannerMutator.mutateAsync(image.url)
            }

            if (data.name) {
                await nameMutator.mutateAsync({ name: data.name })
            }
        } catch (error: unknown) {
            setError('submit', { message: (error as Error).message })
        }

        setIsOpen(false)
    }

    const isOwner = session.data?.user && session.data.user.id === account?.id
    let bannerImage = account?.bannerImage
    const onFileChanged = (
        e: React.ChangeEvent<HTMLInputElement>,
        setState: IUseState<File | null>
    ) => {
        //
        const files = e.target.files
        const file = files?.[0] ?? null
        if (!file) return
        const sizeInMB = file.size / (1024 * 1024)
        if (sizeInMB > 1) {
            // TODO: Set Error, File too large
            return
        }
        setState(file)
    }

    return (
        <>
            <Head>
                <title> {account ? account.name : 'Not Found'} </title>
                <meta
                    name="description"
                    content="K-pop Digital Card Trading Platform"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen relative flex-col">
                <div
                    className="h-52 bg-neutral-900"
                    style={
                        {
                            backgroundImage:
                                account?.bannerImage &&
                                `url(${account.bannerImage})`,
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                        } as React.CSSProperties
                    }
                ></div>
                <div className="absolute inset-0 top-32  h-[125px] w-[125px]  border-4 mx-8 rounded-full border-white bg-neutral-600">
                    {account?.image && (
                        <>
                            <Image
                                src={account.image}
                                alt="profile image"
                                width={125}
                                height={125}
                                className="rounded-full"
                            />
                        </>
                    )}
                </div>

                <div className="flex justify-between mt-12 mb-2 ml-8 mr-4">
                    <div>
                        <h1 className="font-bold text-2xl">
                            {account?.name ?? 'Not Found'}
                        </h1>
                        {account?.handle && (
                            <h2 className=" text-lg font-thin">
                                @{account.handle}
                            </h2>
                        )}
                    </div>
                    {isOwner && (
                        <div className="my-2 flex justify-end items-center">
                            <button
                                style={
                                    {
                                        borderWidth: '1.75px',
                                    } as React.CSSProperties
                                }
                                className="h-7 font-medium text-xs px-2 border-neutral-800 rounded-3xl hover:text-white hover:bg-neutral-800 transition-colors hover:border-neutral-500"
                                onClick={() => setIsOpen(true)}
                            >
                                Edit Profile
                            </button>

                            <Modal
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                                className="absolute w-2/3 bg-neutral-900 text-white rounded-md "
                            >
                                <div className="flex-col">
                                    <div className="flex justify-between items-center px-4 my-2">
                                        <div className="flex gap-4 items-center">
                                            <button
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <BiX size={'1.7rem'} />
                                            </button>
                                            <span className="font-medium">
                                                Edit Profile
                                            </span>
                                        </div>
                                    </div>
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="relative h-40 items-center justify-center">
                                            <div
                                                id="banner-image"
                                                className={`h-40 bg-neutral-900`}
                                                style={
                                                    {
                                                        backgroundImage:
                                                            bannerImage &&
                                                            `url(${bannerImage})`,
                                                        backgroundPosition:
                                                            'center',
                                                        backgroundRepeat:
                                                            'no-repeat',
                                                        backgroundSize: 'cover',
                                                        opacity: '0.7',
                                                    } as React.CSSProperties
                                                }
                                            />
                                            <div
                                                className={clsx(
                                                    'absolute inset-0',
                                                    'h-full',
                                                    'flex gap-4',
                                                    'justify-center items-center '
                                                )}
                                            >
                                                <label
                                                    htmlFor="banner"
                                                    className="bg-neutral-500/80 p-2 rounded-full items-center cursor-pointer"
                                                >
                                                    <BiCamera
                                                        size={'1.5rem'}
                                                        strokeWidth={'0.1'}
                                                        className="text-white/70"
                                                    />
                                                    <input
                                                        id="banner"
                                                        type="file"
                                                        hidden
                                                        {...register('banner')}
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        onChange={(e) =>
                                                            onFileChanged(
                                                                e,
                                                                setBannerFile
                                                            )
                                                        }
                                                    />
                                                </label>
                                                <div className="flex p-1 bg-neutral-500/80  rounded-full items-center  cursor-pointer">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            //
                                                            bannerImage = null
                                                            const element =
                                                                document.getElementById(
                                                                    'banner-image'
                                                                ) as HTMLDivElement | null
                                                            if (element)
                                                                element.style.backgroundImage =
                                                                    ''
                                                        }}
                                                    >
                                                        <BiX
                                                            size={'2rem'}
                                                            strokeWidth={'0.1'}
                                                            className="text-white/70"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            id="avatar-image"
                                            style={
                                                {
                                                    backgroundImage:
                                                        account?.image
                                                            ? `url(${account.image})`
                                                            : undefined,
                                                    backgroundPosition:
                                                        'center',
                                                    backgroundRepeat:
                                                        'no-repeat',
                                                    backgroundSize: 'cover',
                                                } as React.CSSProperties
                                            }
                                            className={clsx(
                                                'absolute inset-0 top-36',
                                                'flex items-center justify-center',
                                                'h-[100px] w-[100px]',
                                                'rounded-full mx-8',
                                                'border-4 border-neutral-900'
                                            )}
                                        >
                                            <div className="flex items-center justify-center">
                                                <label
                                                    htmlFor="avatar"
                                                    className="bg-neutral-500/80 p-2 rounded-full  cursor-pointer "
                                                >
                                                    <BiCamera
                                                        size={'1.5rem'}
                                                        strokeWidth={'0.1'}
                                                        className="text-white/70"
                                                    />
                                                    <input
                                                        id="avatar"
                                                        type="file"
                                                        hidden
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        {...register('avatar')}
                                                        onChange={(e) =>
                                                            onFileChanged(
                                                                e,
                                                                setAvatarFile
                                                            )
                                                        }
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="buffer h-16"></div>

                                        <div className="mx-8">
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-white text-sm font-bold mb-2"
                                                >
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    {...register('name')}
                                                    placeholder={account?.name}
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-neutral-900 border-1 border-white/30 leading-tight focus:outline-none focus:shadow-outline focus:border-white/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="m-8 ">
                                            <button
                                                type="submit"
                                                className="px-4 py-1 bg-white text-neutral-900 rounded-xl"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>
                        </div>
                    )}
                </div>

                <div className="border-t-2"></div>
            </main>
        </>
    )
}

export default CollectorPage
