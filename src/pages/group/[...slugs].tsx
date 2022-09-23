import { Artist, Group } from '@prisma/client'
import clsx from 'clsx'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { trpc } from '../../utils/trpc'
import { Image as PImage } from '@prisma/client'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { isPaladin } from '../../utils/permissions'
import { Modal } from '../../components/modal/modal'
import { IUseState } from '../../types/react'
import { ErrorOption, SubmitHandler, useForm } from 'react-hook-form'
import { BiCamera, BiX } from 'react-icons/bi'
import upload from '../../utils/image'
import Link from 'next/link'
import slug from '../../utils/slug'
const GroupPage: NextPage = () => {
    const router = useRouter()
    const id = router.query.slugs?.[0] ?? ''
    const queryResult = trpc.useQuery(['group.info', id])
    return (
        <>
            <Head>
                <title>
                    {queryResult.data ? queryResult.data.englishName : 'Group'}
                </title>
                <meta
                    name="description"
                    content="K-pop Digital Card Trading Platform"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {}
            <main className={clsx('min-h-screen')}>
                {queryResult.isLoading ? (
                    <LoadingComponent />
                ) : queryResult.isError ? (
                    <ErrorComponent />
                ) : queryResult.data ? (
                    <CoreComponent group={queryResult.data} />
                ) : (
                    <>
                        <div> No Data </div>
                    </>
                )}
            </main>
        </>
    )
}

const LoadingComponent: React.FC = () => {
    return (
        <>
            <div className="h-full flex justify-center items-center">
                <span>Loading...</span>
            </div>
        </>
    )
}

const ErrorComponent: React.FC = () => {
    return (
        <>
            <div>Error</div>
        </>
    )
}

type CoreProps = {
    group: Group & {
        bannerImage: PImage | null
        logoImage: PImage | null
    }
}
const CoreComponent: React.FC<CoreProps> = ({ group }) => {
    const bannerImage = group.bannerImage?.url
    const logoImage = group.logoImage?.url ?? ''
    const [section, setSection] = useState(0)

    return (
        <div className="h-full">
            <div
                style={
                    {
                        backgroundImage: bannerImage && `url(${bannerImage})`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                    } as React.CSSProperties
                }
                className="relative h-52 w-full bg-neutral-800"
            >
                <div className="h-[120px] w-[120px] rounded-full absolute -bottom-12 border-8 border-white mx-6">
                    <Image
                        src={logoImage}
                        alt="logo image"
                        height={120}
                        width={120}
                        className="rounded-full"
                    />
                </div>
            </div>
            <div className="mx-6 mt-16 mb-4 flex ">
                <div>
                    <h1 className="text-3xl font-bold antialiased">
                        {group.englishName}
                    </h1>
                    {group.hangulName && (
                        <h2 className="text-xl font-semibold antialiased text-gray-600">
                            {group.hangulName}
                        </h2>
                    )}
                </div>
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
                            Artists
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
                            Eras
                        </span>
                    </button>
                </div>
            </div>
            <div className="m-6">
                {section == 0 ? (
                    <MemberSection groupId={group.id} labelId={group.labelId} />
                ) : (
                    <EraSection />
                )}
            </div>
        </div>
    )
}

type ComponentProp = {
    groupId: string
    labelId: string
}
const MemberSection: React.FC<ComponentProp> = ({ groupId, labelId }) => {
    const session = useSession()
    const roles = session.data?.user?.roles ?? []
    const canEdit = isPaladin(roles)
    const query = trpc.useQuery(['group.members.get', groupId])

    if (query.isLoading) return <LoadingComponent />
    if (query.isError) return <ErrorComponent />
    if (query.isSuccess && query.data) {
        const members = query.data
        return (
            <>
                <div className="flex flex-col gap-4">
                    {canEdit && (
                        <AddMemberComponent
                            groupId={groupId}
                            labelId={labelId}
                        />
                    )}
                    <div className={clsx('flex flex-wrap gap-8')}>
                        {members.map((member) => {
                            return (
                                <div key={member.artistId}>
                                    <Link
                                        href={`/artist/${
                                            member.artistId
                                        }/${slug(member.artist.englishName)}`}
                                    >
                                        <a>
                                            <MemberCard
                                                artist={member.artist}
                                            />
                                        </a>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </>
        )
    }

    return <></>
}

type MemberCardProp = {
    artist: Artist & {
        avatar: PImage | null
    }
}
const MemberCard: React.FC<MemberCardProp> = ({ artist }) => {
    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <div className="bg-neutral-400 h-56 w-56  rounded-full transition-all hover:border-2 hover:border-neutral-800">
                    <Image
                        alt="artist avatar"
                        src={artist.avatar?.url ?? ''}
                        width={224}
                        height={224}
                        className="rounded-full"
                        objectFit="cover"
                        objectPosition="top"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-2xl">{artist.englishName}</p>
                    {artist.hangulName && (
                        <p className="text-sm text-neutral-500 font-light italic">
                            {artist.hangulName}
                        </p>
                    )}
                </div>
            </div>
        </>
    )
}

const AddMemberComponent: React.FC<ComponentProp> = ({ groupId, labelId }) => {
    const [present, setPresent] = useState(false)
    return (
        <>
            <div className="flex justify-end">
                <button
                    onClick={() => setPresent(true)}
                    style={
                        {
                            borderWidth: '1.75px',
                        } as React.CSSProperties
                    }
                    className="h-7 w-36 font-medium text-xs px-2 border-neutral-800 rounded-3xl hover:text-white hover:bg-neutral-800 transition-colors hover:border-neutral-500"
                >
                    Add Member
                </button>
            </div>
            <Modal
                isOpen={present}
                setIsOpen={setPresent}
                className="absolute w-2/3 bg-neutral-900 text-white rounded-md "
            >
                <AddMemberModal
                    setModal={setPresent}
                    groupId={groupId}
                    labelId={labelId}
                />
            </Modal>
        </>
    )
}

type ModalProp = ComponentProp & { setModal: IUseState<boolean> }
type MemberModalValues = {
    englishName: string
    hangulName?: string
    submit?: string
}
const AddMemberModal: React.FC<ModalProp> = ({
    groupId,
    labelId,
    setModal,
}) => {
    const { register, handleSubmit, setError } = useForm<MemberModalValues>()
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const mutator = trpc.useMutation(['group.members.create'])
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
    const onSubmit: SubmitHandler<MemberModalValues> = async ({
        englishName,
        hangulName,
    }) => {
        //
        let savedAvatarImage: PImage | undefined
        let savedBannerImage: PImage | undefined
        if (logoFile) {
            savedAvatarImage = await upload(logoFile, false)
        }
        if (bannerFile) {
            savedBannerImage = await upload(bannerFile)
        }

        try {
            await mutator.mutateAsync({
                avatarImageId: savedAvatarImage?.id,
                bannerImageId: savedBannerImage?.id,
                englishName,
                hangulName,
                groupId,
                labelId,
            })
            setModal(false)
        } catch (error) {
            setError('submit', error as ErrorOption)
        }
    }
    return (
        <>
            <div className="flex-col">
                <div className="flex justify-between items-center px-4 my-2">
                    <div className="flex gap-4 items-center">
                        <button onClick={() => setModal(false)}>
                            <BiX size={'1.7rem'} />
                        </button>
                        <span className="font-medium">Add Artist</span>
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
                                Avatar
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
                                Banner
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

const EraSection: React.FC = () => {
    // const session = useSession()
    // const roles = session.data?.user?.roles ?? []
    // const canEdit = isSentinel(roles)
    return <></>
}
export default GroupPage
