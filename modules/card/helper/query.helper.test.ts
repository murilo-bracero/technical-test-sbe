import { describe, expect, it } from "vitest";
import { buildCardDbQuery } from "./query.helper.js";
import { CardQuery } from "../models/card.js";
import { Filter, Document } from "mongodb";

describe("buildCardDbQuery", () => {
  it("should build one query with provided fields", () => {
    const query: CardQuery = {
      id: "1",
      name: "name",
      rarity: ["rarity"],
      game: "game",
      gameAttributes: {
        attribute: ["value"],
      },
      page: 1,
      size: 10,
    };

    const expectedQuery: Filter<Document> = {
      id: "1",
      name: "name",
      rarity: "rarity",
      game: "game",
      "gameAttributes.attribute": "value",
    };

    expect(buildCardDbQuery(query)).toStrictEqual(expectedQuery);
  });

  it("should build one query with provided fields - numeric value variant", () => {
    const query: CardQuery = {
      id: "1",
      name: "name",
      rarity: ["rarity"],
      game: "game",
      gameAttributes: {
        randomAtt: {
          gt: 1,
          lt: 2,
        },
      },
      page: 1,
      size: 10,
    };

    const expectedQuery: Filter<Document> = {
      id: "1",
      name: "name",
      rarity: "rarity",
      game: "game",
      "gameAttributes.randomAtt": {
        $gte: 1,
        $lte: 2,
      },
    };

    expect(buildCardDbQuery(query)).toStrictEqual(expectedQuery);
  });

  it("should build one query with provided fields - numeric value without all attributes variant", () => {
    const query: CardQuery = {
      id: "1",
      name: "name",
      rarity: ["rarity"],
      game: "game",
      gameAttributes: {
        randomAtt: {
          gt: 1,
        },
      },
      page: 1,
      size: 10,
    };

    const expectedQuery: Filter<Document> = {
      id: "1",
      name: "name",
      rarity: "rarity",
      game: "game",
      "gameAttributes.randomAtt": {
        $gte: 1,
      },
    };

    expect(buildCardDbQuery(query)).toStrictEqual(expectedQuery);
  });

  it("should encapsulate search value inside text/search clause", () => {
    const query: CardQuery = {
      search: "search",
      page: 1,
      size: 10,
    };

    const expectedQuery: Filter<Document> = {
      $text: { $search: "search" },
    };

    expect(buildCardDbQuery(query)).toStrictEqual(expectedQuery);
  });
});
