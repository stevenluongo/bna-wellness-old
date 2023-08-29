import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const weeksRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      return await prisma.week.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
    } catch (error) {
      throw error;
    }
  }),

  id: publicProcedure
    .input(z.object({ weekStart: z.string(), roomId: z.string() }))
    .query(async ({ input }) => {
      try {
        return await prisma.week.findFirst({
          where: {
            start: input.weekStart,
          },
          include: {
            checks: {
              where: {
                roomId: input.roomId,
              },
            },
          },
        });
      } catch (error) {
        throw error;
      }
    }),

  dates: publicProcedure.query(async () => {
    try {
      return await prisma.week.findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          start: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        weekStart: z.string(),
        roomId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await prisma.week.create({
          data: {
            start: input.weekStart,
            rooms: {
              connect: {
                id: input.roomId,
              },
            },
          },
        });
      } catch (error) {
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // delete the room
      return await prisma.room.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
