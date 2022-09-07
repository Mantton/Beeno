import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { trpc } from '../../utils/trpc'
import { Label, Image as PImage } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { FaEllipsisH } from 'react-icons/fa'
import { IUseState } from '../../types/react'
import { Modal } from '../../components/modal/modal'
import { BiCamera, BiX } from 'react-icons/bi'
import { SubmitHandler, useForm } from 'react-hook-form'
import upload from '../../utils/image'
const ExploreCompaniesPage: NextPage = () => {
    const queryResult = trpc.useQuery(['label.get'])
    return (
        <>
            <Head>
                <title>Explore Labels</title>
                <meta
                    name="description"
                    content="K-pop Digital Card Trading Platform"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={clsx()}>
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

                {queryResult.data && <Core labels={queryResult.data}></Core>}
            </main>
        </>
    )
}

type ImagedLabel = Label & {
    logoImage: PImage
    bannerImage: PImage | null
}
const Core: React.FC<{ labels: ImagedLabel[] }> = ({ labels }) => {
    const session = useSession()
    const user = session.data?.user
    const canEdit = (user?.roles ?? []).some((role) =>
        [1, 2, 3].includes(role.roleId)
    )
    const [presentInsertModal, setPresentInsertModal] = useState(false)
    return (
        <div className="container mx-auto my-4">
            <div className="flex items-center gap-4">
                <h1 className="font-bold text-5xl"> Explore Labels </h1>
                {canEdit && (
                    <>
                        <button onClick={() => setPresentInsertModal(true)}>
                            <FaEllipsisH />
                        </button>
                        <Modal
                            isOpen={presentInsertModal}
                            setIsOpen={setPresentInsertModal}
                            className="absolute w-2/3 bg-neutral-900 text-white rounded-md "
                        >
                            <UpdateModal
                                setPresentModal={setPresentInsertModal}
                            />
                        </Modal>
                    </>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
                {labels.map((label) => {
                    return (
                        <div key={label.id}>
                            <Card label={label} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
// LabelCard
type CardProps = { label: ImagedLabel }
const Card: React.FC<CardProps> = ({ label }) => {
    const session = useSession()
    const [presentModal, setPresentModal] = useState(false)

    const roles = (session.data?.user?.roles ?? []).map((v) => v.roleId)
    const canEdit = roles.some((v) => [1, 2, 3].includes(v))
    return (
        <>
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
                className="relative flex justify-start items-end bg-black text-white p-2 w-full h-48 rounded-lg"
            >
                <div className="absolute inset-0 w-full bg-gradient-to-b from-transparent to-black rounded-md"></div>
                <div className="flex gap-2 items-center">
                    <div>
                        <Image
                            src={label.logoImage.url}
                            height={50}
                            width={50}
                            alt="logo"
                            className="rounded-full object-cover"
                        />
                    </div>
                    <span className="z-[1] text-sm text-white">
                        {label.name}
                    </span>
                </div>

                {canEdit && (
                    <>
                        <div className="absolute  p-2 right-0 top-0">
                            <button onClick={() => setPresentModal(true)}>
                                <FaEllipsisH className="opacity-80" />
                            </button>
                            <Modal
                                isOpen={presentModal}
                                setIsOpen={setPresentModal}
                                className="absolute w-2/3 bg-neutral-900 text-white rounded-md "
                            >
                                <UpdateModal
                                    setPresentModal={setPresentModal}
                                    labelId={label.id}
                                    labelName={label.name}
                                    bannerImage={label.bannerImage?.url}
                                    logoImage={label.logoImage.url}
                                />
                            </Modal>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

// Modal
type ModalProps = {
    setPresentModal: IUseState<boolean>
    labelId?: string
    labelName?: string
    logoImage?: string
    bannerImage?: string
}

type FormValues = {
    name?: string
    submit?: string
}
const UpdateModal: React.FC<ModalProps> = ({
    setPresentModal,
    labelId,
    labelName,
    logoImage,
    bannerImage,
}) => {
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const { register, handleSubmit, setError } = useForm<FormValues>()
    const newLabelMutator = trpc.useMutation(['label.create'])
    const updateLabelMutator = trpc.useMutation(['label.update'])
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
    useEffect(() => {
        if (logoFile) setImageForElement('logo-image', logoFile)
        if (bannerFile) setImageForElement('banner-image', bannerFile)
        // return () => {
        //     setBannerFile(null)
        //     setLogoFile(null)
        // }
    }, [logoFile, bannerFile])

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            let savedLogoImage: PImage | undefined
            let savedBannerImage: PImage | undefined
            if (logoFile) {
                savedLogoImage = await upload(logoFile, false)
            }
            if (bannerFile) {
                savedBannerImage = await upload(bannerFile)
            }
            if (isUpdating) {
                // Exists, Update
                await updateLabelMutator.mutateAsync({
                    id: labelId,
                    logoImageId: savedLogoImage?.id,
                    bannerImageId: savedBannerImage?.id,
                    name: data.name,
                })
            } else {
                if (!data.name) throw 'Invalid Name'

                if (!savedLogoImage) throw 'MUST UPLOAD IMAGE'
                await newLabelMutator.mutateAsync({
                    name: data.name,
                    logoImageId: savedLogoImage.id,
                    bannerImageId: savedBannerImage?.id,
                })
            }
        } catch (error: unknown) {
            console.log(error)
            setError('submit', { message: (error as Error).message })
        }

        setPresentModal(false)
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
        if (sizeInMB > 1) {
            // TODO: Set Error, File too large
            return
        }
        setState(file)
    }
    const isUpdating = !!labelId
    return (
        <>
            <div className="flex-col">
                <div className="flex justify-between items-center px-4 my-2">
                    <div className="flex gap-4 items-center">
                        <button onClick={() => setPresentModal(false)}>
                            <BiX size={'1.7rem'} />
                        </button>
                        <span className="font-medium">
                            {isUpdating ? `Update Label` : 'Add New Label'}
                        </span>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4 mx-8 mb-8 mt-2">
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
                                placeholder={labelName}
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
                                        backgroundImage: logoImage
                                            ? `url(${logoImage})`
                                            : undefined,
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
                                        backgroundImage: bannerImage
                                            ? `url(${bannerImage})`
                                            : undefined,
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
                                {isUpdating ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
export default ExploreCompaniesPage
