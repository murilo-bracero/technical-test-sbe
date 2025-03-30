import { Transform } from "node:stream";

export class TagGameTransform extends Transform {
  constructor(private gameName: string) {
    super({ objectMode: true });
  }

  _transform(chunk: any, encode: string, cb: Function) {
    chunk.game = this.gameName;

    this.push(chunk);

    cb();
  }
}
