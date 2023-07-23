import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { createMembershipValidationSchema } from "~/components/memberships/createMembershipModal";
import { editMembershipValidationSchema } from "~/components/memberships/editMembershipModal";

const prisma = new PrismaClient();

export const membershipRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      const memberships = await prisma.membership.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
      return memberships;
    } catch (error) {
      throw error;
    }
  }),

  ids: publicProcedure.query(async () => {
    try {
      const memberships = await prisma.membership.findMany({
        select: {
          id: true,
        },
      });
      return memberships;
    } catch (error) {
      throw error;
    }
  }),

  id: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const memberships = await prisma.membership.findUnique({
          where: {
            id: input.id,
          },
        });
        return memberships;
      } catch (error) {
        throw error;
      }
    }),

  create: protectedProcedure
    .input(createMembershipValidationSchema)
    .mutation(async ({ input }) => {
      const membership = await prisma.membership.create({
        data: input,
      });

      return membership;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // delete the membership
      return await prisma.membership.delete({
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
