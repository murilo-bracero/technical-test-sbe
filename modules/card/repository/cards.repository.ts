import { log } from "../../logger.js";
import { Card, CardEntity, CardQuery } from "../models/card.js";
import { Collection, Db, Document, Filter, FindOptions } from "mongodb";

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
    const dbQuery = this.buildQuery(query);

    log.debug({ dbQuery }, "Query");

    let sort: any = { id: 1 };
    const options: FindOptions = { limit, skip: offset };

    if (Object.hasOwn(query, "$text")) {
      options.projection = { score: { $meta: "textScore" } };
      sort = { score: { $meta: "textScore" }, ...sort };
    }

    return this.col.find<CardEntity>(dbQuery, options).sort(sort).toArray();
  }

  private buildQuery(query: CardQuery): Filter<Document> {
    const q: Filter<Document> = {};

    if (query.id) {
      q["id"] = query.id;
    }

    if (query.name) {
      q["name"] = query.name;
    }

    if (query.search) {
      q["$text"] = { $search: query.search };
    }

    if (query.rarity) {
      q["rarity"] = this.handleArrayQuery(q, "rarity", query.rarity);
    }

    if (query.game) {
      q["game"] = query.game;
    }

    if (query.gameAttributes) {
      for (const [key, value] of Object.entries(query.gameAttributes)) {
        const queryKey = `gameAttributes.${key}`;

        if (Array.isArray(value)) {
          this.handleArrayQuery(q, queryKey, value);
        } else if (typeof value === "object") {
          this.handleNumericQuery(q, queryKey, value);
        } else {
          q[queryKey] = value;
        }
      }
    }

    return q;
  }

  private handleArrayQuery(
    q: { [key: string]: any },
    key: string,
    value: any[]
  ) {
    if (value.length === 0) {
      return;
    }

    if (value.length === 1) {
      return (q[key] = value[0]);
    }

    return (q[key] = { $in: value });
  }

  private handleNumericQuery(
    q: { [key: string]: any },
    key: string,
    value: any
  ) {
    const subq: { [key: string]: any } = {};

    if (value.gt) {
      subq["$gte"] = value.gt;
    }

    if (value.lt) {
      subq["$lte"] = value.lt;
    }

    q[key] = subq;
  }
}
