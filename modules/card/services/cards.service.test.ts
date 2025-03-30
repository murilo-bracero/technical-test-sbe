import { describe, expect, it, vi } from "vitest";

import { CardsService } from "./cards.service.js";
import { ObjectId } from "mongodb";

const cardsRepositoryMock = vi.fn();
cardsRepositoryMock.prototype.find = vi.fn();

describe("CardsService", () => {
  it("findCardsByQuery - should pass parameters to repository and return mapped result", async () => {
    const repositoryMock = new cardsRepositoryMock();

    const mockResult = {
      _id: new ObjectId(),
      id: 1,
      name: "test",
      game: "test",
      rarity: "test",
      gameAttributes: {
        att: "test",
      },
    };

    repositoryMock.find.mockResolvedValue([mockResult]);

    const cardsService = new CardsService(repositoryMock);

    const input = {
      page: 1,
      size: 10,
      search: "test",
    };

    const cards = await cardsService.findCardsByQuery(input);

    expect(repositoryMock.find).toHaveBeenCalledWith(input, 0, 10);
    expect(cards).toStrictEqual([
      {
        id: 1,
        name: "test",
        game: "test",
        rarity: "test",
        gameAttributes: {
          att: "test",
        },
      },
    ]);
  });

  it("findCardsByQuery - should throw error if repository fails", async ({
    expect,
  }) => {
    const repositoryMock = new cardsRepositoryMock();

    repositoryMock.find.mockRejectedValue(new Error("test"));

    const cardsService = new CardsService(repositoryMock);

    const input = {
      page: 1,
      size: 10,
      search: "test",
    };

    const result = cardsService.findCardsByQuery(input);

    await expect(result).rejects.toThrowError("test");

    expect(repositoryMock.find).toHaveBeenCalledWith(input, 0, 10);
  });
});
