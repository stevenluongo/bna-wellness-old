import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { createMembershipValidationSchema } from "~/components/memberships/createMembershipModal";
import { editMembershipValidationSchema } from "~/components/memberships/editMembershipModal";
import { createRoomValidationSchema } from "~/components/rooms/createRoomModal";

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
        });
      } catch (error) {
        throw error;
      }
    }),

  create: protectedProcedure
    .input(createRoomValidationSchema)
    .mutation(async ({ input }) => {
      const { userIds, ...rest } = input;
      console.log(userIds, rest);
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
    .input(editMembershipValidationSchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      return await prisma.membership.update({
        where: { id },
        data: { ...rest },
      });
    }),
});
