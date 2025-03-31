import { z } from "zod";
import { appConfig } from "../../env.js";

const CommaSeparatedStringToArray = z
  .string()
  .transform((value) => value.split(",").map((rarity) => rarity.trim()))
  .pipe(z.array(z.string()));

const NumberRangeQueryParameter = z.object({
  gt: z.coerce.number().optional(),
  lt: z.coerce.number().optional(),
});

const GameAttributesQueryParameters = z
  .record(z.string(), z.coerce.number())
  .or(
    z.record(
      z.string(),
      NumberRangeQueryParameter.or(CommaSeparatedStringToArray)
    )
  );

const PageQueryParameter = z.coerce.number().default(1);

const SizeQueryParameter = z.coerce
  .number()
  .max(appConfig.api.maxCardsPerRequest)
  .default(10);

export const FindCardsQueryParameters = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  rarity: CommaSeparatedStringToArray.optional(),
  game: z.string().optional(),
  gameAttributes: GameAttributesQueryParameters.optional(),
  _search: z.string().optional(),
  _page: PageQueryParameter,
  _size: SizeQueryParameter,
});

export type FindCardsQueryParameters = z.infer<typeof FindCardsQueryParameters>;
