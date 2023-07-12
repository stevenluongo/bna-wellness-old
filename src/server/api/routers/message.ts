import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const messageRouter = createTRPCRouter({
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

  ids: publicProcedure.query(async () => {
    try {
      const messages = await prisma.message.findMany({
        select: {
          id: true,
        },
      });
      return messages;
    } catch (error) {
      throw error;
    }
  }),

  id: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const messages = await prisma.message.findUnique({
          where: {
            id: input.id,
          },
          include: {
            replies: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                author: true,
              },
            },
          },
        });
        return messages;
      } catch (error) {
        throw error;
      }
    }),

  create: protectedProcedure
    .input(z.object({ body: z.string(), authorId: z.string() }))
    .mutation(async ({ input }) => {
      const message = await prisma.message.create({
        data: {
          body: input.body,
          author: {
            connect: {
              id: input.authorId,
            },
          },
        },
      });

      return message;
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
