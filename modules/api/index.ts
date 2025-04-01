import express, {
  Express,
  Router,
  Request,
  Response,
  NextFunction,
} from "express";
import { CardsController } from "./controllers/cards.controller.js";
import { buildCardsRoute } from "./routes/cards.route.js";
import { log } from "../logger.js";
import { pinoHttp } from "pino-http";
import { CardsService } from "../card/services/cards.service.js";
import apicache from "apicache";
import swaggerUi from 'swagger-ui-express';
import openApiDoc from '../../docs/openapi.json' with {type: 'json'};

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

    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

    this.app.get("/", (req, res) => {
      res.json({ status: "UP" });
    });

    this.app.use(
      (
        err: Error & { status?: number },
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.error(err, req.url);

        if (res.headersSent) {
          return next(err);
        }

        res.status(err.status || 500).send();
      }
    );

    this.app;
  }

  start(port: number) {
    this.app.listen(port, () => {
      log.info({ port }, "Server started");
    });
  }
}
