import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import clsx from 'clsx'
import React from 'react'

const tabs = ['Labels', 'Groups', 'Artists', 'Eras', 'Cards', 'Collectors']
const ExplorePage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Explore</title>
                <meta
                    name="description"
                    content="K-pop Digital Card Trading Platform"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main
                className={clsx(
                    'container mx-auto',
                    'grid gap-8',
                    'w-full content-center items-center justify-center',
                    'min-h-screen p-4',
                    'sm: grid-cols-1',
                    'md: grid-cols-2',
                    'lg: grid-cols-3'
                )}
            >
                {tabs.map((v) => {
                    return (
                        <>
                            <Link href={`/explore/${v.toLowerCase()}`}>
                                <a className="">
                                    <div
                                        key={v}
                                        className="relative flex justify-center bg-neutral-700 rounded-md shadow-md"
                                    >
                                        <div
                                            style={
                                                {
                                                    backgroundImage:
                                                        'url(https://aegaeon.mantton.com/ceres.jpeg)',
                                                } as React.CSSProperties
                                            }
                                            className="h-36 w-full rounded-md"
                                        ></div>
                                        <span className="absolute rounded-md h-full w-full bg-black/50 inset-0 flex justify-center items-center text-white antialiased font-bold text-xl">
                                            {v}
                                        </span>
                                    </div>
                                </a>
                            </Link>
                        </>
                    )
                })}
            </main>
        </>
    )
}

export default ExplorePage
