import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const prisma = new PrismaClient();

export const priceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        currency: z.string(),
        unitAmount: z.number(),
        interval: z.enum(["day", "week", "month", "year"]),
        intervalCount: z.number(),
        productId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await stripe.prices.create({
        currency: input.currency,
        unit_amount: input.unitAmount,
        product: input.productId,
        recurring: {
          interval: input.interval,
          interval_count: input.intervalCount,
        },
      });
    }),

  //   update: protectedProcedure
  //     .input(
  //       z.object({
  //         id: z.string(),
  //         name: z.string().optional(),
  //         description: z.string().optional(),
  //         isActive: z.boolean().optional(),
  //       })
  //     )
  //     .mutation(async ({ input }) => {
  //       const { id, ...data } = input;
  //       return await stripe.products.update(input.id, data);
  //     }),
});
