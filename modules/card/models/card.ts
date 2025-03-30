import { ObjectId } from "mongodb";

export type Card = {
  id: string;
  game: string;
  name: string;
  rarity: string;
  gameAttributes: {
    [key: string]: any;
  };
};

export type CardEntity = {
  _id: ObjectId;
  score?: number;
} & Card;

export type CardQuery = {
  id?: string;
  name?: string;
  rarity?: string[];
  game?: string;
  gameAttributes?: {
    [key: string]:
      | {
          gt?: number;
          lt?: number;
        }
      | string[]
      | number;
  };
  search?: string;
  page: number;
  size: number;
};
