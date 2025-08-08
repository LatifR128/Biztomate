import { createTRPCRouter } from "./create-context";

export const appRouter = createTRPCRouter({
  // Add tRPC routes here when needed
});

export type AppRouter = typeof appRouter;