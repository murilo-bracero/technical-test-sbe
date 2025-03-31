import express, { Express, Router } from "express";
import { CardsController } from "./controllers/cards.controller.js";
import { buildCardsRoute } from "./routes/cards.route.js";
import { log } from "../logger.js";
import { pinoHttp } from "pino-http";
import { CardsService } from "../card/services/cards.service.js";
import apicache from "apicache";

export class Api {
  private app: Express;

  constructor(cardsService: CardsService) {
    this.app = express();

    const cardsController = new CardsController(cardsService);

    this.config(buildCardsRoute(cardsController));
  }

  private config(...routers: Router[]) {
    const cache = apicache.options({
      statusCodes: {
        include: [200],
      },
      respectCacheControl: true,
    }).middleware;

    this.app.use(express.json());
    this.app.disable("x-powered-by");
    this.app.use(pinoHttp({ logger: log }));

    this.app.use(cache("15 minutes"));

    routers.forEach((router) => {
      this.app.use(router);
    });

    this.app.get("/", (req, res) => {
      res.json({ status: "UP" });
    });
  }

  start(port: number) {
    this.app.listen(port, () => {
      log.info({ port }, "Server started");
    });
  }
}
