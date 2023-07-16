import { Membership } from "@prisma/client";
import { useIsMutating } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import CreateMembershipModal from "~/components/memberships/createMembershipModal";
import withAdminAuth from "~/hocs/withAdminAuth";
import { ssgInit } from "~/server/ssg-init";
import { api } from "~/utils/api";

const columnHelper = createColumnHelper<Membership>();

const Memberships = () => {
  const [open, setOpen] = useState(false);

  const utils = api.useContext();

  const { data } = api.memberships.all.useQuery(undefined, {
    staleTime: 3000,
  });

  const table = useReactTable({
    data: data ? data : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleChange = (v: boolean) => {
    setOpen(v);
  };

  const number = useIsMutating();

  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.clients.all.invalidate();
    }
  }, [number, utils]);

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handleChange(true)}>Create Membership</button>
      <CreateMembershipModal open={open} handleChange={handleChange} />
    </div>
  );
};

export default withAdminAuth(Memberships);

export const getStaticProps = async () => {
  const ssg = ssgInit();
  await ssg.memberships.all.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};

const columns = [
  columnHelper.accessor("name", {
    header: () => "Name",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("description", {
    header: () => "Description",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("unitAmount", {
    header: () => "Unit Amount",
    cell: (info) => `$${info.getValue() / 100}`,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("interval", {
    header: () => "Interval",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("intervalCount", {
    header: () => "Interval Count",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("stripeProductId", {
    header: () => "Stripe Product Id",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("stripePriceId", {
    header: () => "Stripe Price Id",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
];
