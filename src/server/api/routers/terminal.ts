import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const terminalRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      const messages = await prisma.message.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
      return messages;
    } catch (error) {
      throw error;
    }
  }),

  active: publicProcedure.query(async () => {
    try {
      return await prisma.terminal.findFirst({
        where: {
          isActive: true,
        },
        include: {
          openedBy: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }),

  id: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        return await prisma.terminal.findUnique({
          where: {
            id: input.id,
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
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // delete all replies to this message
      await prisma.reply.deleteMany({
        where: {
          messageId: input.id,
        },
      });

      // delete the message
      return await prisma.message.delete({
        where: {
          id: input.id,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), body: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      return await prisma.message.update({
        where: { id },
        data: { ...rest },
      });
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
