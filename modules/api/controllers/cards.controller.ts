import { Request, Response } from "express";
import { FindCardsQueryParameters } from "../dto/query.js";
import { log } from "../../logger.js";
import { Card } from "../../card/models/card.js";
import { CardsService } from "../../card/services/cards.service.js";

export class CardsController {
  constructor(private cardsService: CardsService) {
    this.findCardsByQuery = this.findCardsByQuery.bind(this);
  }

  async findCardsByQuery(req: Request, res: Response): Promise<void> {
    const validation = FindCardsQueryParameters.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        errors: validation.error.errors,
      });
      return;
    }

    const params = validation.data!!;

    this.cardsService
      .findCardsByQuery({
        ...params,
        page: params._page,
        size: params._size,
        search: params._search,
      })
      .then((cards: Card[]) => {
        res.json(cards);
      })
      .catch((error: Error) => {
        log.error(error, "Error finding cards");
        res.status(500);
      });
  }
}
