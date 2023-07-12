import { PrismaClient, type User } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: Omit<User, "hash" | "salt">;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, _req) {
        if (!credentials?.password) {
          throw new Error("No password provided");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials?.username,
          },
        });

        if (!user) {
          throw new Error("No user found with that username");
        }

        if (!validatePassword(user, credentials?.password)) {
          throw new Error("Invalid username and password combination");
        }

        const { hash, salt, ...rest } = user;

        return rest;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      user && (token.user = user);
      if (trigger === "update" && session?.username) {
        token.user = {
          username: session.username,
        };
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user = token.user as User;
      return session;
    },
    redirect({ url }) {
      return Promise.resolve(url);
    },
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export function validatePassword(user: User, inputPassword: string) {
  const inputHash = crypto
    .pbkdf2Sync(inputPassword, user.salt, 1000, 64, "sha512")
    .toString("hex");
  const passwordsMatch = user.hash === inputHash;
  return passwordsMatch;
}
