import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Dialog, Transition } from "@headlessui/react";
import { BiX } from "react-icons/bi";
const CollectorPage: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const id = router.query.slugs?.[0];
  const session = useSession();
  const result = trpc.useQuery(["collector.get", id ?? ""]);
  if (!id) {
    return <div>How?</div>;
  }
  if (result.isLoading) {
    return <div>Loading</div>;
  }

  if (result.isError && result.error) {
    return <div>Encountered an error {result.error.message}</div>;
  }
  const account = result.data;

  const isOwner = session.data?.user?.id === account?.id;
  return (
    <>
      <Head>
        <title> {account ? account.name : "Not Found"} </title>
        <meta
          name="description"
          content="K-pop Digital Card Trading Platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-col">
        <div className="h-48 bg-neutral-900"></div>

        {account?.image && (
          <>
            <div className="absolute h-[125px] w-[125px] z-10 border-4 inset-0 mx-8 top-48 rounded-full border-neutral-900">
              <Image
                src={account.image}
                alt="profile image"
                width={125}
                height={125}
                className="rounded-full"
              />
            </div>
          </>
        )}
        {isOwner && (
          <div className="mx-8 my-2 flex justify-end">
            <button
              className="font-medium text-xs border-2 py-1 px-2 border-neutral-800 rounded-3xl hover:text-white hover:bg-neutral-800 transition-colors hover:border-neutral-500"
              onClick={() => setIsOpen(true)}
            >
              Edit Profile
            </button>
            <Transition show={isOpen} as={Fragment}>
              <Dialog onClose={() => setIsOpen(false)}>
                {/*
          Use one Transition.Child to apply one transition to the backdrop...
        */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                {/*
          ...and another Transition.Child to apply a separate transition
          to the contents.
        */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    {/* Container to center the panel */}
                    <div className="flex min-h-full items-center justify-center w-2/3">
                      {/* The actual dialog panel  */}
                      <Dialog.Panel className="w-full bg-neutral-900 text-white rounded-md ">
                        <div className="flex-col">
                          <div className="flex justify-between items-center px-4 my-2">
                            <div className="flex  gap-4 items-center">
                              <button onClick={() => setIsOpen(false)}>
                                <BiX size={"1.7rem"} />
                              </button>
                              <span className="font-medium">Edit Profile</span>
                            </div>
                            <button
                              onClick={() => {
                                // TODO: Save
                                setIsOpen(false);
                              }}
                            >
                              <span className="px-2 rounded-xl bg-white text-black text-sm">
                                Done
                              </span>
                            </button>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </div>
                  </div>
                </Transition.Child>
              </Dialog>
            </Transition>
          </div>
        )}

        <div className="mt-8 mb-2 mx-8">
          <h1 className="font-bold text-2xl">{account?.name ?? "Not Found"}</h1>
          <h2 className=" text-lg font-thin">@{account?.handle}</h2>
        </div>

        <div className="border-2"></div>
      </main>
    </>
  );
};

export default CollectorPage;
