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
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import Reply from "~/components/messages/reply";
import EditClientModal from "~/components/clients/editClientModal";

const Client = () => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  const handleChange = (v: boolean) => {
    setOpen(v);
  };

  const { data: client } = api.clients.id.useQuery(
    { id: router.query.id as string },
    {
      staleTime: 3000,
    }
  );

  const utils = api.useContext();

  const { data: session } = useSession();

  //   const createReplyMutation = api.reply.create.useMutation({
  //     async onMutate(reply) {
  //       /**
  //        * Optimistically update the data
  //        * with the newly added task
  //        */
  //       await utils.message.id.cancel();

  //       const message = utils.message.id.getData({
  //         id: router.query.id as string,
  //       });

  //       if (!message) {
  //         return;
  //       }

  //       /**
  //        * Optimistically update the data
  //        * with the newly added reply
  //        */
  //       const updatedReplies = [
  //         ...message.replies,
  //         {
  //           ...reply,
  //           createdAt: new Date(),
  //           id: `${Math.random()}`,
  //           author: session?.user as User,
  //         },
  //       ];

  //       utils.message.id.setData(
  //         { id: router.query.id as string },
  //         {
  //           ...message,
  //           replies: updatedReplies,
  //         }
  //       );
  //       // reset form inputs
  //       methods.reset();
  //     },
  //   });

  const deleteClientMutation = api.clients.delete.useMutation({
    async onMutate() {
      await utils.clients.all.cancel();
      const allClients = utils.clients.all.getData();
      if (!allClients) {
        return;
      }
      utils.clients.all.setData(
        undefined,
        allClients.filter((m) => m.id != client?.id)
      );
      router.push("/clients");
    },
  });

  const number = useIsMutating();

  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.clients.id.invalidate({ id: router.query.id as string });
    }
  }, [number, utils, router.query.id]);

  if (!client) {
    router.push("/clients");
    return null;
  }

  return (
    <div className="grid place-items-center pt-8">
      <div className="w-[500px]">
        <Link href="/clients">Back</Link>
        <div>
          <span className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {client.firstName} {client.lastName}
            </h1>
            {session?.user.id && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 cursor-pointer fill-red-500"
                onClick={() => deleteClientMutation.mutate({ id: client.id })}
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
          <p className="text-gray-500">Email Address: {client.email}</p>
          <p className="text-gray-500">Home Number: {client.homePhone}</p>
          <p className="text-gray-500">Cell Number: {client.cellPhone}</p>
          <p className="text-gray-500">Age: {client.age}</p>
        </div>
        <button onClick={() => setOpen(true)}>Edit</button>
        <EditClientModal
          open={open}
          handleChange={handleChange}
          client={client}
        />
      </div>
    </div>
  );
};

export default withAuth(Client);

export const getStaticPaths = async () => {
  const ssg = ssgInit();
  const clients = await ssg.clients.ids.fetch();
  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return {
    paths: clients.map((m) => ({ params: { id: m.id } })),
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const ssg = ssgInit();
  await ssg.clients.id.prefetch({ id: params?.id as string });
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
