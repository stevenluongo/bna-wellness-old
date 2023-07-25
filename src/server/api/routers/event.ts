import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const eventsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        startTime: z.date(),
        endTime: z.date(),
        weekStart: z.date(),
        roomId: z.string(),
        trainerId: z.string(),
        terminalId: z.string(),
        clientId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { clientId, terminalId, trainerId, roomId, weekStart, ...rest } =
        input;
      return await prisma.event.create({
        data: {
          ...rest,
          room: {
            connect: {
              id: roomId,
            },
          },
          checks: {
            create: [
              {
                ...rest,
                weekStart,
                clientId,
                terminalId,
                trainerId,
              },
            ],
          },
        },
      });
    }),
});
