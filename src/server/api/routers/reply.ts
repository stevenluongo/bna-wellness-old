import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const replyRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      const replies = await prisma.reply.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
      return replies;
    } catch (error) {
      throw error;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        body: z.string(),
        authorId: z.string(),
        messageId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const message = await prisma.reply.create({
        data: {
          body: input.body,
          author: {
            connect: {
              id: input.authorId,
            },
          },
          message: {
            connect: {
              id: input.messageId,
            },
          },
        },
      });

      return message;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const reply = await prisma.reply.delete({
        where: {
          id: input.id,
        },
      });

      return reply;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), body: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      return await prisma.reply.update({
        where: { id },
        data: { ...rest },
      });
    }),
});
