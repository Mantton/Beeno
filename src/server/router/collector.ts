import { createRouter } from "./context";
import { z } from "zod";

export const collectorRouter = createRouter().query("get", {
  input: z.string(),
  async resolve({ ctx, input }) {
    return await ctx.prisma.user.findUnique({
      where: {
        id: input,
      },
      select: {
        id: true,
        image: true,
        name: true,

        cards: true,
      },
    });
  },
});
