import { User } from "@prisma/client";
import { useIsMutating } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateRoomModal from "~/components/rooms/createRoomModal";
import withAdminAuth from "~/hocs/withAdminAuth";
import { ssgInit } from "~/server/ssg-init";
import { api } from "~/utils/api";

const columnHelper = createColumnHelper<Omit<User, "hash" | "salt">>();

const Users = () => {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const utils = api.useContext();

  const { data } = api.users.all.useQuery(undefined, {
    staleTime: 10000,
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
      void utils.users.all.invalidate();
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
              key={row.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/users/${row.original.id}`)}
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
      <button onClick={() => handleChange(true)}>Create Room</button>
      <CreateRoomModal open={open} handleChange={handleChange} />
    </div>
  );
};

export default withAdminAuth(Users);

export const getStaticProps = async () => {
  const ssg = ssgInit();
  await ssg.users.all.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};

const columns = [
  columnHelper.accessor("createdAt", {
    header: () => "Created At",
    cell: (info) => info.getValue().toISOString(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("firstName", {
    header: () => "Created At",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("lastName", {
    header: () => "Created At",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
];
