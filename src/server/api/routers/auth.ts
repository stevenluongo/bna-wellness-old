import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import * as crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const inputSchema = z.object({
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["ADMIN", "DEFAULT"]),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure.input(inputSchema).mutation(async ({ input }) => {
    const { hash, salt } = generateHash(input.password);

    const user = await prisma.user.create({
      data: {
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        hash,
        salt,
        role: input.role,
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

    return user;
  }),
});

export const generateHash = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
};
