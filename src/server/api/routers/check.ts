import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { createCheckValidationSchema } from "~/components/events/createCheckModal";

const prisma = new PrismaClient();

export const checkRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createCheckValidationSchema)
    .mutation(async ({ input }) => {
      console.log(input);
      return await prisma.check.create({
        data: {
          ...input,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.check.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
