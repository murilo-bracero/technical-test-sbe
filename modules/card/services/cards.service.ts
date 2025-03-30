import { Card, CardEntity, CardQuery } from "../models/card.js";
import { CardRepository } from "../repository/cards.repository.js";

export class CardsService {
  constructor(private cardsRepository: CardRepository) {}

  async findCardsByQuery(query: CardQuery): Promise<Card[]> {
    const limit = query.size;
    const offset = (query.page - 1) * limit;

    return this.cardsRepository
      .find(query, offset, limit)
      .then((cards: CardEntity[]) =>
        cards.map((card: CardEntity) => ({
          id: card.id,
          game: card.game,
          name: card.name,
          rarity: card.rarity,
          gameAttributes: card.gameAttributes,
        }))
      );
  }
}
