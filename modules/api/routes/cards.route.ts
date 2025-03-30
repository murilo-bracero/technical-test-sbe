import { Router } from "express";
import { CardsController } from "../controllers/cards.controller.js";

const BASE_CARDS_ROUTE = "/api/v1/cards";

export function buildCardsRoute(cardsController: CardsController): Router {
  const router = Router();

  router.get(BASE_CARDS_ROUTE, cardsController.findCardsByQuery);

  return router;
}
