import { createReadStream, fstat } from "node:fs";
import { pipeline, Readable } from "node:stream";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import fs from "node:fs/promises";

// @ts-ignore
import JSONStream from "JSONStream";

import { concatReaders } from "./utils/concat-readers.js";
import { appConfig } from "../env.js";
import { CardRepository } from "../card/repository/cards.repository.js";
import { BatchTransform } from "./steps/batch-transform.js";
import { DatabaseWriteStream } from "./steps/db-writer.js";
import { log } from "../logger.js";
import { TagGameTransform } from "./steps/tag-game-transform.js";
import path from "node:path";

export class CardLoaderJob {
  constructor(private cardRepository: CardRepository) {}

  async run() {
    const traceId = randomUUID();

    const assetsFolder = path.join(process.cwd(), "datasets");

    const files = await fs.readdir(assetsFolder);

    const readers = files
      .filter((f) => f.endsWith(".json"))
      .filter((f) => f.replace("-cards.json", "").trim() !== "")
      .map((f) => {
        return this.createReadableGameJSONStream(
          new URL(path.join(assetsFolder, f), import.meta.url),
          f.replace("-cards.json", "").trim(),
          traceId
        );
      });

    const batchTransform = new BatchTransform(
      appConfig.batch.cardLoaderChunkSize
    );

    const dbWriteStream = new DatabaseWriteStream(this.cardRepository);

    const asyncPipeline = promisify(pipeline);

    return asyncPipeline(
      concatReaders(...readers),
      batchTransform,
      dbWriteStream
    ).then(() => log.info({ traceId }, "Card Loader job finished"));
  }

  createReadableGameJSONStream(
    filePath: URL,
    game: string,
    traceId: string = randomUUID()
  ): Readable {
    const gameTag = new TagGameTransform(game);

    return createReadStream(filePath)
      .on("ready", () =>
        log.info({ traceId, game }, `Card import read started`)
      )
      .on("end", () => log.info({ traceId, game }, `Card import read finished`))
      .on("error", (err) =>
        log.error(err, `Card import error`, { traceId, game })
      )
      .pipe(JSONStream.parse("*"))
      .pipe(gameTag);
  }
}
