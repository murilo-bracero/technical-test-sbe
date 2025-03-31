import { CardRepository } from "./modules/card/repository/cards.repository.js";
import { CardLoaderJob } from "./modules/job/card-loader.job.js";
import { appConfig } from "./modules/env.js";
import { Api } from "./modules/api/index.js";
import { CardsService } from "./modules/card/services/cards.service.js";
import {
  clearCardsCollection,
  connect,
  createIndexes,
} from "./modules/db/index.js";

async function main() {
  const db = await connect();

  await clearCardsCollection(db);

  await createIndexes(db);

  const cardsRepository = new CardRepository(db);

  const cardsService = new CardsService(cardsRepository);

  const api = new Api(cardsService);

  const job = new CardLoaderJob(cardsRepository);

  job.run();

  api.start(appConfig.port);
}

main();
