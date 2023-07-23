import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const userRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      return await prisma.user.findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }),
});
