import { useIsMutating } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import withAuth from "~/hocs/withAuth";
import { ssgInit } from "~/server/ssg-init";
import { api } from "~/utils/api";

const Terminal = () => {
  const utils = api.useContext();

  const router = useRouter();

  const { data: terminal } = api.terminal.active.useQuery(undefined, {
    staleTime: 10000,
  });

  const { data } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { user } = data!;

  const openTerminalMutation = api.terminal.open.useMutation({
    async onMutate(newTerminal) {
      utils.terminal.active.setData(undefined, {
        isActive: true,
        openedAt: new Date(),
        updatedAt: new Date(),
        id: `${Math.random()}`,
        closedAt: null,
        openedBy: {
          ...user,
          salt: `${Math.random()}`,
          hash: `${Math.random()}`,
        },
        ...newTerminal,
      });
    },
  });

  const closeTerminalMutation = api.terminal.close.useMutation({
    async onMutate() {
      await utils.terminal.active.cancel();
      const activeTerminal = utils.terminal.active.getData();
      if (!activeTerminal) {
        return;
      }
      utils.terminal.active.setData(undefined, null);
    },
  });

  const number = useIsMutating();

  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.terminal.active.invalidate();
    }
  }, [number, utils]);

  if (!terminal)
    return (
      <div>
        <h1>Terminal</h1>
        <p>Terminal not found</p>
        <button
          onClick={() =>
            openTerminalMutation.mutate({
              openedById: user.id,
            })
          }
        >
          {" "}
          Create Terminal{" "}
        </button>
      </div>
    );

  return (
    <div className="grid place-items-center pt-8">
      <div className="w-[500px]">
        <a className="cursor-pointer" onClick={() => router.back()}>
          Back
        </a>
        <div>
          <span className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Terminal</h1>
            {/* <svg
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
              </svg> */}
          </span>
          <p className="text-gray-500">
            Opened By: {terminal.openedBy.firstName}{" "}
            {terminal.openedBy.lastName}
          </p>
          <p className="text-gray-500">
            Opened At: {new Date(terminal.openedAt).toLocaleString()}
          </p>
          <p className="text-gray-500">
            Last updated: {new Date(terminal.updatedAt).toLocaleString()}
          </p>
          <button
            className="mt-2 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={() =>
              closeTerminalMutation.mutate({
                id: terminal.id,
              })
            }
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Terminal);

export const getStaticProps = async () => {
  const ssg = ssgInit();
  await ssg.terminal.active.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
