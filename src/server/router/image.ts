import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
export const imageRouter = createProtectedRouter()
  .mutation("avatar", {
    input: z.string(),
    resolve({ ctx, input }) {
      const user = ctx.session.user.id;
      return ctx.prisma.user.update({
        where: {
          id: user,
        },
        data: {
          image: input,
        },
      });
    },
  })
  .mutation("banner", {
    input: z.string(),
    resolve({ ctx, input }) {
      const user = ctx.session.user.id;
      return ctx.prisma.user.update({
        where: {
          id: user,
        },
        data: {
          bannerImage: input,
        },
      });
    },
  });
