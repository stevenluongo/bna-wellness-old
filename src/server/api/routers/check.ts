import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { editRoomValidationSchema } from "~/components/rooms/editRoomModal";
import { createCheckValidationSchema } from "~/components/events/createEventModal";

const prisma = new PrismaClient();

export const checkRouter = createTRPCRouter({
  // week: publicProcedure
  //   .input(z.object({ roomId: z.string(), weekStart: z.string() }))
  //   .query(async ({ input }) => {
  //     const { weekStart, roomId } = input;
  //     try {
  //       return await prisma.check.findMany({
  //         where: {
  //           weekStart,
  //           roomId,
  //         },
  //         orderBy: {
  //           createdAt: "asc",
  //         },
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   }),

  // ids: publicProcedure.query(async () => {
  //   try {
  //     return await prisma.room.findMany({
  //       orderBy: {
  //         createdAt: "asc",
  //       },
  //       select: {
  //         id: true,
  //       },
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }),

  // id: publicProcedure
  //   .input(z.object({ id: z.string() }))
  //   .query(async ({ input }) => {
  //     try {
  //       return await prisma.room.findUnique({
  //         where: {
  //           id: input.id,
  //         },
  //         include: {
  //           users: {
  //             select: {
  //               id: true,
  //               username: true,
  //               firstName: true,
  //               lastName: true,
  //               role: true,
  //               createdAt: true,
  //               title: true,
  //             },
  //           },
  //           checks: true,
  //         },
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   }),

  create: protectedProcedure
    .input(
      z.object({
        startTime: z.date(),
        endTime: z.date(),
        weekStart: z.string(),
        roomId: z.string(),
        trainerId: z.string(),
        terminalId: z.string(),
        clientId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.check.create({
        data: {
          ...input,
        },
      });
    }),

  // delete: protectedProcedure
  //   .input(z.object({ id: z.string() }))
  //   .mutation(async ({ input }) => {
  //     // delete the room
  //     return await prisma.room.delete({
  //       where: {
  //         id: input.id,
  //       },
  //     });
  //   }),

  // update: protectedProcedure
  //   .input(editRoomValidationSchema)
  //   .mutation(async ({ input }) => {
  //     const { id, userIds, ...rest } = input;

  //     return await prisma.room.update({
  //       where: { id },
  //       data: {
  //         ...rest,
  //         users: {
  //           set: userIds && [],
  //           connect: userIds?.map((id) => ({ id })),
  //         },
  //       },
  //     });
  //   }),
});
