import { GetStaticPropsContext } from "next";
import withAuth from "~/hocs/withAuth";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { ssgInit } from "~/server/ssg-init";
import { useZodForm } from "~/utils/useZodForm";
import { z } from "zod";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useIsMutating } from "@tanstack/react-query";
import { useEffect } from "react";
import { User } from "@prisma/client";
import Reply from "~/components/messages/reply";

const Message = () => {
  const router = useRouter();

  const { data: message } = api.message.id.useQuery(
    { id: router.query.id as string },
    {
      staleTime: 3000,
    }
  );

  const utils = api.useContext();

  const { data: session } = useSession();

  const createReplyMutation = api.reply.create.useMutation({
    async onMutate(reply) {
      /**
       * Optimistically update the data
       * with the newly added task
       */
      await utils.message.id.cancel();

      const message = utils.message.id.getData({
        id: router.query.id as string,
      });

      if (!message) {
        return;
      }

      /**
       * Optimistically update the data
       * with the newly added reply
       */
      const updatedReplies = [
        ...message.replies,
        {
          ...reply,
          createdAt: new Date(),
          id: `${Math.random()}`,
          author: session?.user as User,
        },
      ];

      utils.message.id.setData(
        { id: router.query.id as string },
        {
          ...message,
          replies: updatedReplies,
        }
      );
      // reset form inputs
      methods.reset();
    },
  });

  const deleteMessageMutation = api.message.delete.useMutation({
    async onMutate() {
      await utils.message.all.cancel();
      const allMessages = utils.message.all.getData();
      if (!allMessages) {
        return;
      }
      utils.message.all.setData(
        undefined,
        allMessages.filter((m) => m.id != message?.id)
      );
      router.push("/messages");
    },
  });

  const methods = useZodForm({
    schema: z.object({
      body: z.string().min(4),
    }),
    defaultValues: {
      body: "",
    },
  });

  const number = useIsMutating();

  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.message.id.invalidate({ id: router.query.id as string });
    }
  }, [number, utils, router.query.id]);

  if (!message) {
    router.push("/messages");
    return null;
  }

  return (
    <div className="grid place-items-center pt-8">
      <div className="w-[500px]">
        <Link href="/messages">Back</Link>
        <span className="mb-4 mt-4 flex items-center">
          <h1 className="w-full text-2xl font-semibold text-gray-900 dark:text-white">
            {message.body}
          </h1>
          {message.authorId === session?.user.id && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5 cursor-pointer fill-red-500"
              onClick={() => deleteMessageMutation.mutate({ id: message.id })}
            >
              <path
                fillRule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
        <div className="mb-4 flex w-[500px] flex-col gap-4">
          {message.replies?.map((reply) => (
            <Reply key={reply.id} reply={reply} />
          ))}
        </div>
        <form
          className="w-[500px] space-y-4"
          onSubmit={methods.handleSubmit(({ body }) =>
            createReplyMutation.mutate({
              body,
              authorId: session?.user.id as string,
              messageId: message.id,
            })
          )}
        >
          <input
            {...methods.register("body")}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
            placeholder="Message Title"
            required
          />
          {methods.formState.errors.body?.message && (
            <p className="text-red-700">
              {methods.formState.errors.body?.message}
            </p>
          )}
          <button
            type="submit"
            className=" w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Create Reply
          </button>
        </form>
      </div>
    </div>
  );
};

export default withAuth(Message);

export const getStaticPaths = async () => {
  const ssg = ssgInit();
  const messages = await ssg.message.ids.fetch();
  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return {
    paths: messages.map((m) => ({ params: { id: m.id } })),
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const ssg = ssgInit();
  await ssg.message.id.prefetch({ id: params?.id as string });
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
