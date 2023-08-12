import { date, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { createRoomValidationSchema } from "~/components/rooms/createRoomModal";
import { editRoomValidationSchema } from "~/components/rooms/editRoomModal";

const prisma = new PrismaClient();

export const roomRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      return await prisma.room.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
    } catch (error) {
      throw error;
    }
  }),

  ids: publicProcedure.query(async () => {
    try {
      return await prisma.room.findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
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
        return await prisma.room.findUnique({
          where: {
            id: input.id,
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                title: true,
              },
            },
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
    .input(createRoomValidationSchema)
    .mutation(async ({ input }) => {
      const { userIds, ...rest } = input;
      return await prisma.room.create({
        data: {
          ...rest,
          users: {
            connect: userIds.map((id) => ({ id })),
          },
        },
      });
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

  update: protectedProcedure
    .input(editRoomValidationSchema)
    .mutation(async ({ input }) => {
      const { id, userIds, ...rest } = input;

      return await prisma.room.update({
        where: { id },
        data: {
          ...rest,
          users: {
            set: userIds && [],
            connect: userIds?.map((id) => ({ id })),
          },
        },
      });
    }),
});
