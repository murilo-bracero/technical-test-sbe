import express, { Express, Router } from "express";
import { CardsController } from "./controllers/cards.controller.js";
import { buildCardsRoute } from "./routes/cards.route.js";
import { log } from "../logger.js";
import { pinoHttp } from "pino-http";
import { CardsService } from "../card/services/cards.service.js";

export class Api {
  private app: Express;
  private cardsRoute: Router;

  constructor(cardsService: CardsService) {
    this.app = express();

    const cardsController = new CardsController(cardsService);
    this.cardsRoute = buildCardsRoute(cardsController);

    this.config();
  }

  config() {
    this.app.use(express.json());
    this.app.disable("x-powered-by");
    this.app.use(pinoHttp({ logger: log }));

    this.app.use(this.cardsRoute);

    this.app.get("/", (req, res) => {
      res.json({ status: "UP" });
    });
  }

  start(port: number) {
    this.app.use(this.cardsRoute);
    this.app.listen(port, () => {
      log.info({ port }, "Server started");
    });
  }
}
