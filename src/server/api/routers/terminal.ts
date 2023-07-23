import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const terminalRouter = createTRPCRouter({
  active: publicProcedure.query(async () => {
    try {
      return await prisma.terminal.findFirst({
        where: {
          isActive: true,
        },
        include: {
          openedBy: true,
          logs: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }),

  open: protectedProcedure
    .input(z.object({ openedById: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.terminal.create({
        data: {
          openedBy: {
            connect: {
              id: input.openedById,
            },
          },
          logs: {
            create: {
              message: `Terminal opened`,
            },
          },
        },
      });
    }),

  close: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.terminal.update({
        where: {
          id: input.id,
        },
        data: {
          isActive: false,
          closedAt: new Date(),
          logs: {
            create: {
              message: `Terminal closed`,
            },
          },
        },
      });
    }),
});
