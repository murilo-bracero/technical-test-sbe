import { log } from "../../logger.js";
import { buildQuery } from "../helper/query.helper.js";
import { Card, CardEntity, CardQuery } from "../models/card.js";
import { Collection, Db, FindOptions } from "mongodb";

export class CardRepository {
  private col: Collection;

  constructor(conn: Db) {
    this.col = conn.collection("cards");
  }

  async insertMany(cards: Card[]) {
    return this.col.insertMany(cards, { ordered: false }).catch((err) => {
      log.error({ err }, "Error inserting cards");
      throw err;
    });
  }

  async find(
    query: CardQuery,
    offset: number,
    limit: number
  ): Promise<CardEntity[]> {
    const dbQuery = buildQuery(query);

    log.debug({ dbQuery }, "Query");

    let sort: any = { id: 1 };
    const options: FindOptions = { limit, skip: offset };

    if (Object.hasOwn(query, "$text")) {
      options.projection = { score: { $meta: "textScore" } };
      sort = { score: { $meta: "textScore" }, ...sort };
    }

    return this.col.find<CardEntity>(dbQuery, options).sort(sort).toArray();
  }
}
