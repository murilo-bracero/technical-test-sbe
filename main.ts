import { Db, MongoClient } from "mongodb";
import { CardRepository } from "./modules/card/repository/cards.repository.js";
import { CardLoaderJob } from "./modules/job/card-loader.job.js";
import { appConfig } from "./modules/env.js";
import { log } from "./modules/logger.js";
import { Api } from "./modules/api/index.js";
import { CardsService } from "./modules/card/services/cards.service.js";

async function main() {
  const client = await MongoClient.connect(
    `mongodb://${appConfig.database.user}:${appConfig.database.password}@${appConfig.database.host}:${appConfig.database.port}`,
    {
      retryWrites: true,
      w: "majority",
    }
  ).catch((err) => {
    log.error(err, "Error connecting to database");
    throw err;
  });

  const db = client.db("cards-database");

  // DISCLAIMER
  // This only exists to facilitate testing and code evaluation,
  // it should not be used in production or in a real service.
  await db.collection("cards").deleteMany({});

  await createIndexes(db);

  const cardsRepository = new CardRepository(db);

  const cardsService = new CardsService(cardsRepository);

  const api = new Api(cardsService);

  const job = new CardLoaderJob(cardsRepository);

  job.run();

  api.start(appConfig.port);
}

async function createIndexes(db: Db): Promise<void> {
  return Promise.all([
    db
      .collection("cards")
      .createIndex({ name: "text" }, { name: "cards_name_text_search_idx" }),
    db
      .collection("cards")
      .createIndex({ id: 1 }, { unique: true, name: "cards_id_unique_idx" }),
    db
      .collection("cards")
      .createIndex(
        { "gameAttributes.ink_cost": -1 },
        { sparse: true, name: "cards_game_attributes_ink_cost_idx" }
      ),
    db
      .collection("cards")
      .createIndex(
        { "gameAttributes.color": 1 },
        { sparse: true, name: "cards_game_attributes_color_idx" }
      ),
  ]).then(() => {
    log.info("Indexes created");
  });
}

main();
