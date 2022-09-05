import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { BiCamera, BiX } from "react-icons/bi";
import { Modal } from "../../components/modal/modal";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
const CollectorPage: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const id = router.query.slugs?.[0];
  const session = useSession();
  const result = trpc.useQuery(["collector.get", id ?? ""]);
  const { register, handleSubmit } = useForm();

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

  const onSubmit = (data: any) => {
    console.log(data);
  };
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

            <Modal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              className="absolute w-2/3 bg-neutral-900 text-white rounded-md"
            >
              <div className="flex-col">
                <div className="flex justify-between items-center px-4 my-2">
                  <div className="flex gap-4 items-center">
                    <button onClick={() => setIsOpen(false)}>
                      <BiX size={"1.7rem"} />
                    </button>
                    <span className="font-medium">Edit Profile</span>
                  </div>
                  {/* <button
                    onClick={() => {
                      // TODO: Save
                      setIsOpen(false);
                    }}
                  >
                    <span className="px-2 py-1 rounded-xl bg-white text-black text-sm">
                      Save
                    </span>
                  </button> */}
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div
                    className={`h-40 bg-neutral-900 ${clsx(
                      account?.bannerImage && account.bannerImage
                    )}`}
                  >
                    <div className=" flex gap-4 h-full justify-center items-center ">
                      <label
                        htmlFor="a"
                        className="bg-neutral-500/30 p-2 rounded-full items-center cursor-pointer"
                      >
                        <BiCamera
                          size={"1.5rem"}
                          strokeWidth={"0.1"}
                          className="text-white/70"
                        />
                        <input
                          id="banner-image"
                          // ref={register}
                          type="file"
                          hidden
                          {...register("banner-image")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          //
                        }}
                      >
                        <BiX
                          size={"2rem"}
                          strokeWidth={"0.1"}
                          className="text-white/70"
                        />
                      </button>
                    </div>
                  </div>

                  <div
                    style={
                      {
                        backgroundImage: `url(${
                          account?.image ??
                          "https://aegaeon.mantton.com/ceres.jpeg"
                        })`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100px 100px",
                      } as React.CSSProperties
                    }
                    className={clsx(
                      "flex items-center justify-center",
                      "h-[100px] w-[100px]",
                      "rounded-full mx-8",
                      "border-4 border-neutral-900"
                    )}
                  >
                    <div className="flex items-center justify-center">
                      <label
                        htmlFor="avatar"
                        className="bg-neutral-500/30 p-2 rounded-full  cursor-pointer "
                      >
                        <BiCamera
                          size={"1.5rem"}
                          strokeWidth={"0.1"}
                          className="text-white/70"
                        />
                        <input
                          id="avatar"
                          type="file"
                          hidden
                          {...register("avater")}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <button type="submit">Submit</button>
                  </div>
                </form>
              </div>
            </Modal>
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
