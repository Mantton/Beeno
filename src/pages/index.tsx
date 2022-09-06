import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Beeno</title>
        <meta
          name="description"
          content="K-pop Digital Card Trading Platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex items-center justify-center min-h-screen p-4">
        <div className="m-4 block">
          <h1 className="text-4xl font-bold mb-5">
            Beeno, A K-pop Digital Card Trading platform.
          </h1>
          <span className="text-2xl opacity-75">
            Explore, collect & trade cards from your favorite artists
            <i> without</i> destroying the environment.
          </span>
          <div className="flex text-white font-semibold mt-5">
            <Link href="/explore">
              <a className="py-3 px-6 bg-primary rounded-md mr-4" href="">
                Explore Collections
              </a>
            </Link>
            <Link href="/leaderboard">
              <a className="py-3 px-6 bg-primary rounded-md">
                View Leaderboard
              </a>
            </Link>
          </div>
        </div>
        <div className="m-2 ">
          <Image
            className="rounded-lg"
            src="https://aegaeon.mantton.com/home.webp"
            alt="sample card"
            width="300"
            height="450"
          />
        </div>
      </main>
    </>
  );
};

export default Home;
