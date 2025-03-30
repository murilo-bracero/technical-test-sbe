import { PassThrough, Readable } from "node:stream";

export function concatReaders(...streams: Readable[]): Readable {
  let pass = new PassThrough({ objectMode: true });

  streams.forEach((stream) => {
    const end = stream == streams.at(-1);
    pass = stream.pipe(pass, { end });
  });

  return pass;
}
