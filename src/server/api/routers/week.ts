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

  dates: publicProcedure.query(async () => {
    try {
      return await prisma.week.findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          date: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }),

  date: publicProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      try {
        return await prisma.week.findFirst({
          where: {
            date: input.date,
          },
          include: {
            events: {
              include: {
                checks: {
                  include: {
                    trainer: {
                      select: {
                        firstName: true,
                        lastName: true,
                        id: true,
                      },
                    },
                    client: {
                      select: {
                        firstName: true,
                        lastName: true,
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        throw error;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await prisma.week.create({
          data: {
            date: input.date,
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
