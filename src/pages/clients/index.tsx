import { Client } from "@prisma/client";
import { useIsMutating } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateClientModal from "~/components/clients/createClientModal";
import withAuth from "~/hocs/withAuth";
import { ssgInit } from "~/server/ssg-init";
import { api } from "~/utils/api";

const columnHelper = createColumnHelper<Client>();

const columns = [
  columnHelper.accessor("firstName", {
    cell: (info) => info.getValue(),
    header: () => <span>First Name</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: "lastName",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("age", {
    header: () => "Age",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
];
const Clients = () => {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const utils = api.useContext();

  const { data } = api.clients.all.useQuery(undefined, {
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
            <tr
              onClick={() => router.push(`/clients/${row.original.id}`)}
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handleChange(true)}>Create Client</button>
      <CreateClientModal open={open} handleChange={handleChange} />
    </div>
  );
};

export default withAuth(Clients);

export const getStaticProps = async () => {
  const ssg = ssgInit();
  await ssg.clients.all.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
