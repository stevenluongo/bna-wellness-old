import { GetStaticPropsContext } from "next";
import withAuth from "~/hocs/withAuth";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { ssgInit } from "~/server/ssg-init";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import EditClientModal from "~/components/clients/editClientModal";
import EditMembershipModal from "~/components/memberships/editMembershipModal";

const Membership = () => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  const handleChange = (v: boolean) => {
    setOpen(v);
  };

  const { data } = api.memberships.id.useQuery(
    { id: router.query.id as string },
    {
      staleTime: 3000,
    }
  );

  const utils = api.useContext();

  const { data: session } = useSession();

  const deactivateProductMutation = api.products.deactivate.useMutation();

  const deleteMembershipMutation = api.memberships.delete.useMutation({
    async onMutate() {
      await utils.memberships.all.cancel();
      const allMemberships = utils.memberships.all.getData();
      if (!allMemberships) {
        return;
      }
      utils.memberships.all.setData(
        undefined,
        allMemberships.filter((m) => m.id != membership?.id)
      );
      utils.memberships.id.setData({ id: membership.id }, null);
      router.push("/admin/memberships");
    },
  });

  const number = useIsMutating();

  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.memberships.id.invalidate({ id: router.query.id as string });
    }
  }, [number, utils, router.query.id]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const membership = data!;

  if (!membership) {
    return null;
  }

  return (
    <div className="grid place-items-center pt-8">
      <div className="w-[500px]">
        <Link href="/admin/memberships">Back</Link>
        <div>
          <span className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{membership.name}</h1>
            {session?.user.id && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 cursor-pointer fill-red-500"
                onClick={async () => {
                  deactivateProductMutation.mutateAsync({
                    id: membership.stripeProductId,
                  });
                  deleteMembershipMutation.mutate({ id: membership.id });
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
          <p className="text-gray-500">Description: {membership.description}</p>
          <p className="text-gray-500">
            Unit Amount: {membership.unitAmount} or $
            {membership.unitAmount / 100}
          </p>
          <p className="text-gray-500">Interval: {membership.interval}</p>
          <p className="text-gray-500">
            Interval Count: {membership.intervalCount}
          </p>
          <p className="text-gray-500">
            Product Id: {membership.stripeProductId}
          </p>
          <p className="text-gray-500">Price Id: {membership.stripePriceId}</p>
          <p className="text-gray-500">
            Is Active: {JSON.stringify(membership.isActive)}
          </p>
        </div>
        <button onClick={() => setOpen(true)}>Edit</button>
        <EditMembershipModal
          open={open}
          handleChange={handleChange}
          membership={membership}
        />
      </div>
    </div>
  );
};

export default withAuth(Membership);

export const getStaticPaths = async () => {
  const ssg = ssgInit();
  const memberships = await ssg.memberships.ids.fetch();
  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return {
    paths: memberships.map((m) => ({ params: { id: m.id } })),
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const ssg = ssgInit();
  const membership = await ssg.memberships.id.fetch({
    id: params?.id as string,
  });

  if (!membership) {
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
