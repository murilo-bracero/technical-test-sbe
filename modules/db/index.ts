import { Db, MongoClient } from "mongodb";
import { appConfig } from "../env.js";
import { log } from "../logger.js";

export async function connect(): Promise<Db> {
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

  return client.db("cards-database");
}

export async function createIndexes(db: Db) {
  return Promise.all([
    db
      .collection("cards")
      .createIndex({ name: "text" }, { name: "cards_name_text_search_idx" }),

    db.collection("cards").createIndex({ name: 1 }, { name: "cards_name_idx" }),

    db
      .collection("cards")
      .createIndex({ id: 1 }, { unique: true, name: "cards_id_unique_idx" }),
    db
      .collection("cards")
      .createIndex({ rarity: 1 }, { name: "cards_rarity_idx" }),

    db.collection("cards").createIndex({ game: 1 }, { name: "cards_game_idx" }),

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

/**
 *
 * !!DISCLAIMER!!
 * This only exists to facilitate testing and code evaluation,
 * it should not be used in production or in a real service.
 *
 * @param db
 * @returns
 */
export async function clearCardsCollection(db: Db): Promise<void> {
  return db
    .collection("cards")
    .deleteMany({})
    .then(() => {
      log.info("Cards collection cleared");
    });
}
