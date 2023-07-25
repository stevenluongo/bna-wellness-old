import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { editUserValidationSchema } from "~/components/users/editUserModal";

const prisma = new PrismaClient();

export const userRouter = createTRPCRouter({
  ids: publicProcedure.query(async () => {
    try {
      return await prisma.user.findMany({
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
        return await prisma.user.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            title: true,
          },
        });
      } catch (error) {
        throw error;
      }
    }),

  all: publicProcedure.query(async () => {
    try {
      return await prisma.user.findMany({
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          title: true,
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
      return await prisma.user.delete({
        where: {
          id: input.id,
        },
      });
    }),

  update: protectedProcedure
    .input(editUserValidationSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      return await prisma.user.update({
        where: { id },
        data,
      });
    }),
});
