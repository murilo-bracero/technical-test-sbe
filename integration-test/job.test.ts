import { beforeAll, describe, expect, test } from "vitest";
import { CardLoaderJob } from "../modules/job/card-loader.job";
import { connect, createIndexes } from "../modules/db";
import { CardRepository } from "../modules/card/repository/cards.repository";
import { Db } from "mongodb";

let job: CardLoaderJob;
let db: Db;

beforeAll(async () => {
  db = await connect();

  await db.dropCollection("cards");

  db.createCollection("cards");

  await createIndexes(db);

  const cardsRepository = new CardRepository(db);

  job = new CardLoaderJob(cardsRepository);
});

describe("CardLoaderJob", () => {
  test("run - Should load cards from all games in the dataset folder", async () => {
    await job.run();

    const lorcanaCount = await db
      .collection("cards")
      .countDocuments({ game: "lorcana" });

    expect(lorcanaCount).toBe(1255);

    const mtgCount = await db
      .collection("cards")
      .countDocuments({ game: "mtg" });

    expect(mtgCount).toBe(29883);
  });
});
