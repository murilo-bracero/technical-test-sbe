import { Writable } from "node:stream";
import { CardRepository } from "../../card/repository/cards.repository.js";
import { log } from "../../logger.js";
import { Card } from "../../card/models/card.js";

export class DatabaseWriteStream extends Writable {
  constructor(private cardRepository: CardRepository) {
    super({ objectMode: true });
  }

  async _write(data: Card[], encode: string, cb: Function) {
    await this.cardRepository
      .insertMany(data)
      .then(() => {
        log.debug("Cards inserted");
      })
      .catch((err) => {
        log.error(err, "card-loader-job::Error inserting cards");
      });
    cb();
  }
}
