// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { artistRouter } from "./artist";
import { collectorRouter } from "./collector";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("artist.", artistRouter)
  .merge("collector.", collectorRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
