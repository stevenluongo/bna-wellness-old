import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const prisma = new PrismaClient();

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        currency: z.string(),
        unitAmount: z.number(),
        interval: z.enum(["day", "week", "month", "year"]),
        intervalCount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await stripe.products.create({
        name: input.name,
        description: input.description,
        default_price_data: {
          currency: input.currency,
          unit_amount: input.unitAmount,
          recurring: {
            interval: input.interval,
            interval_count: input.intervalCount,
          },
        },
      });
    }),
});
