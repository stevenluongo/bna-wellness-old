/* eslint-disable @typescript-eslint/no-non-null-assertion */
import withAuth from "~/hocs/withAuth";
import { ssgInit } from "~/server/ssg-init";
import { GetStaticPropsContext } from "next";

const Events = () => {
  return <p>week</p>;
};

export default withAuth(Events);

export const getStaticPaths = async () => {
  const ssg = ssgInit();
  const weeks = await ssg.weeks.dates.fetch();
  return {
    paths: weeks.map((m) => ({ params: { id: m.date } })),
    fallback: "blocking",
  };
};

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const ssg = ssgInit();
  const week = await ssg.weeks.date.fetch({ date: ctx.params?.week as string });

  if (!week) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
