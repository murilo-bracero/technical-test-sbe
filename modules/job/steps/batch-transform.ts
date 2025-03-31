import { Transform } from "node:stream";
import { log } from "../../logger.js";
import { CardEntryCore } from "../models/card-entry.js";

export class BatchTransform extends Transform {
  private batch: any[] = [];
  private batchSize: number;

  constructor(batchSize: number, options?: any) {
    super({ ...options, objectMode: true });
    this.batchSize = batchSize;
  }

  _transform(chunk: CardEntryCore, encode: string, cb: Function) {
    const validation = CardEntryCore.safeParse(chunk);

    if (!validation.success) {
      log.warn(
        { validationErrors: validation.error },
        "Invalid card in batch, ignoring"
      );
      cb();
    }

    const { id, name, rarity, game, ...gameAttributes } = validation.data!!;

    this.batch.push({
      id,
      name,
      rarity,
      game,
      gameAttributes,
    });

    if (this.batch.length === this.batchSize) {
      this.push(this.batch);
      this.batch = [];
    }

    cb();
  }

  _flush(cb: Function) {
    if (this.batch.length > 0) {
      this.push(this.batch);
    }
    cb();
  }
}
