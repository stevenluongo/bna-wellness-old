import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./api/root";
import { prisma } from "./db";
import superjson from "superjson";

export const ssgInit = () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { session: null, prisma },
    transformer: superjson,
  });
