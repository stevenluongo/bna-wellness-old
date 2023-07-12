import withAuth from "~/hocs/withAuth";
import { api } from "~/utils/api";
import { useEffect } from "react";
import Link from "next/link";
import { useIsMutating } from "@tanstack/react-query";
import MessageForm from "~/components/messages/form";
import { ssgInit } from "~/server/ssg-init";

const Messages = () => {
  const utils = api.useContext();

  const { data: messages } = api.message.all.useQuery(undefined, {
    staleTime: 3000,
  });

  const number = useIsMutating();

  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.message.all.invalidate();
    }
  }, [number, utils]);

  return (
    <div className="grid place-items-center pt-8">
      <Link href="/">Home</Link>
      <h1 className="mb-4 w-[500px] text-2xl font-semibold text-gray-900 dark:text-white">
        Messages
      </h1>
      <div className="mb-4 flex w-[500px] flex-col gap-4">
        {messages?.map((message) => (
          <Link
            href={`/messages/${message.id}`}
            className="flex cursor-pointer justify-between"
            key={message.id}
          >
            <p>{message.body}</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5zm-10.5 4.5a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V10.5a.75.75 0 011.5 0v8.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V8.25a3 3 0 013-3h8.25a.75.75 0 010 1.5H5.25z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ))}
      </div>
      <MessageForm />
    </div>
  );
};

export default withAuth(Messages);

export const getStaticProps = async () => {
  const ssg = ssgInit();
  await ssg.message.all.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
