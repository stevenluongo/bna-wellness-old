import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { createClientValidationSchema } from "~/components/clients/createClientModal";

const prisma = new PrismaClient();

export const clientRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      const clients = await prisma.client.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
      return clients;
    } catch (error) {
      throw error;
    }
  }),

  ids: publicProcedure.query(async () => {
    try {
      const clientIds = await prisma.client.findMany({
        select: {
          id: true,
        },
      });
      return clientIds;
    } catch (error) {
      throw error;
    }
  }),

  id: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const client = await prisma.client.findUnique({
          where: {
            id: input.id,
          },
        });
        return client;
      } catch (error) {
        throw error;
      }
    }),

  create: protectedProcedure
    .input(createClientValidationSchema)
    .mutation(async ({ input }) => {
      console.log("mutation");
      const client = await prisma.client.create({
        data: input,
      });

      console.log(client);

      return client;
    }),

  //   delete: protectedProcedure
  //     .input(z.object({ id: z.string() }))
  //     .mutation(async ({ input }) => {
  //       // delete all replies to this message
  //       await prisma.reply.deleteMany({
  //         where: {
  //           messageId: input.id,
  //         },
  //       });

  //       // delete the message
  //       return await prisma.message.delete({
  //         where: {
  //           id: input.id,
  //         },
  //       });
  //     }),

  //   update: protectedProcedure
  //     .input(z.object({ id: z.string(), body: z.string() }))
  //     .mutation(async ({ input }) => {
  //       const { id, ...rest } = input;

  //       return await prisma.message.update({
  //         where: { id },
  //         data: { ...rest },
  //       });
  //     }),
});
