import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

const CollectorPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.slugs?.[0];

  if (!id) {
    return <div>How?</div>;
  }
  const result = trpc.useQuery(["collector.get", id]);

  if (result.isLoading) {
    return <div>Loading</div>;
  }

  if (result.isError && result.error) {
    return <div>Encountered an error {result.error.message}</div>;
  }
  const account = result.data;

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

      <main>
        <h1>{account?.name ?? "Not Found"}</h1>
      </main>
    </>
  );
};

export default CollectorPage;
