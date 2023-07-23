import { useIsMutating } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
        logs: [
          {
            id: `${Math.random()}`,
            createdAt: new Date(),
            terminalId: `${Math.random()}`,
            message: "Terminal opened",
          },
        ],
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
          Create Terminal
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
          {terminal.logs.map((log) => (
            <p key={log.id} className="text-gray-500">
              {new Date(log.createdAt).toLocaleString()} - {log.message}
            </p>
          ))}
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
