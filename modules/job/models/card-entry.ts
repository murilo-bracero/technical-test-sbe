import { z } from "zod";

export const CardEntryCore = z
  .object({
    id: z.string().nonempty(),
    name: z.string().nonempty(),
    rarity: z.string().nonempty(),
  })
  .passthrough();
