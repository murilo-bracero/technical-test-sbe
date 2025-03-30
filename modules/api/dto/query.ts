import { z } from "zod";
import { appConfig } from "../../env.js";

const commaSeparatedStringToArray = z
  .string()
  .transform((value) => value.split(",").map((rarity) => rarity.trim()))
  .pipe(z.array(z.string()));

export const FindCardsQueryParameters = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  rarity: commaSeparatedStringToArray.optional(),
  game: z.string().optional(),
  gameAttributes: z
    .record(z.string(), z.coerce.number())
    .or(
      z.record(
        z.string(),
        z
          .object({
            gt: z.coerce.number().optional(),
            lt: z.coerce.number().optional(),
          })
          .or(commaSeparatedStringToArray)
      )
    )
    .optional(),
  _search: z.string().optional(),
  _page: z.coerce.number().default(1),
  _size: z.coerce.number().max(appConfig.api.maxCardsPerRequest).default(10),
});

export type FindCardsQueryParameters = z.infer<typeof FindCardsQueryParameters>;
