import Head from "next/head";
import withAuth from "~/hocs/withAuth";

const Dashboard = () => {
  return (
    <>
      <Head>
        <title>Dashboard | Before n&apos; After</title>
        <meta name="description" content="Dashboard" />
      </Head>
      <main className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]"></main>
    </>
  );
};

export default withAuth(Dashboard);
