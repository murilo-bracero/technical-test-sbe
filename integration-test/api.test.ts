import express from "express";

import { Api } from "../modules/api/index";
import { CardRepository } from "../modules/card/repository/cards.repository";
import { CardsService } from "../modules/card/services/cards.service";
import { connect, createIndexes } from "../modules/db/index";

import request from "supertest";
import { beforeAll, describe, expect, test } from "vitest";
import { Card } from "../modules/card/models/card";

let app: express.Application;

beforeAll(async () => {
  const db = await connect();

  db.createCollection("cards");

  await db.collection("cards").deleteMany({});

  const rarities = ["common", "uncommon", "rare", "Super Rare"];
  const colors = ["W", "U", "B", "R", "G"];

  for (let i = 0; i < 10; i++) {
    await db.collection("cards").insertOne({
      name: "Card " + i,
      game: "game 1",
      id: "card-" + i,
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      gameAttributes: {
        ink_cost: Math.floor(Math.random() * 10),
      },
    });
  }

  for (let i = 10; i < 20; i++) {
    // DISCLAIMER
    // This created a flaky tests, in real world the test data should be predictable.
    await db.collection("cards").insertOne({
      name: "Card " + i,
      id: "card-" + i,
      game: "Game 2",
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      gameAttributes: {
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    });
  }

  await createIndexes(db);

  const cardsRepository = new CardRepository(db);

  const cardsService = new CardsService(cardsRepository);

  const api = new Api(cardsService);

  app = api["app"];
});

describe("GET /api/v1/cards", () => {
  test("Should return a paged list of cards", async () => {
    const response = await request(app).get("/api/v1/cards");

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(10);
  });

  test("Should paginate over _page field", async () => {
    const response = await request(app).get("/api/v1/cards");

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(10);

    const response2 = await request(app!!)
      .get("/api/v1/cards")
      .query({ _page: 2 });

    expect(response2.statusCode).toBe(200);

    expect(response2.body).toHaveLength(10);

    expect(response2.body).not.toStrictEqual(response.body);
  });

  test("Should return a paged list of cards", async () => {
    const response = await request(app).get("/api/v1/cards");

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(10);
  });

  test("Should comply with _size parameter", async () => {
    const response = await request(app)
      .get("/api/v1/cards")
      .query({ _size: 5 });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(5);
  });

  test("Should return search results based on _search parameter", async () => {
    const response = await request(app)
      .get("/api/v1/cards")
      .query({ _search: "4", _size: 5 });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(1);

    const body: Card = response.body.at(0);

    expect(body.name).toBe("Card 4");
  });

  test("Should return allow and comply with nested query parameters", async () => {
    const response = await request(app)
      .get("/api/v1/cards")
      .query({ "gameAttributes[color]": "B", _size: 5 });

    expect(response.statusCode).toBe(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);

    response.body.forEach((card: Card) => {
      expect(card.gameAttributes.color).toBe("B");
    });
  });

  test("Should allow comparative query paramaters agains numeric fields", async () => {
    const response = await request(app).get("/api/v1/cards").query({
      "gameAttributes[ink_cost][gt]": 2,
      "gameAttributes[ink_cost][lt]": 5,
      _size: 5,
    });

    expect(response.statusCode).toBe(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);

    response.body.forEach((card: Card) => {
      expect(card.gameAttributes.ink_cost).toBeGreaterThanOrEqual(2);
      expect(card.gameAttributes.ink_cost).toBeLessThanOrEqual(5);
    });
  });

  test("Should comply with id query parameter", async () => {
    const response = await request(app).get("/api/v1/cards").query({
      id: "card-2",
      _size: 5,
    });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(1);

    const body: Card = response.body.at(0);

    expect(body.id).toBe("card-2");
  });

  test("Should comply with name query parameter", async () => {
    const response = await request(app).get("/api/v1/cards").query({
      name: "Card 2",
      _size: 5,
    });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveLength(1);

    const body: Card = response.body.at(0);

    expect(body.id).toBe("card-2");
    expect(body.name).toBe("Card 2");
  });

  test("Should allow array query parameters in rarity", async () => {
    const response = await request(app).get("/api/v1/cards").query({
      rarity: "common,uncommon",
      _size: 5,
    });

    expect(response.statusCode).toBe(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const cards: Card[] = response.body;

    cards.forEach((card) => {
      expect(["common", "uncommon"]).toContain(card.rarity);
    });
  });
});
