import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { messageRouter } from "./routers/message";
import { authRouter } from "./routers/auth";
import { replyRouter } from "./routers/reply";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  message: messageRouter,
  auth: authRouter,
  reply: replyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
