import { Document, Filter } from "mongodb";
import { CardQuery } from "../models/card.js";

export function buildQuery(query: CardQuery): Filter<Document> {
  const q: Filter<Document> = {};

  if (query.id) {
    q["id"] = query.id;
  }

  if (query.name) {
    q["name"] = query.name;
  }

  if (query.search) {
    q["$text"] = { $search: query.search };
  }

  if (query.rarity) {
    q["rarity"] = handleArrayQuery(query.rarity);
  }

  if (query.game) {
    q["game"] = query.game;
  }

  if (!query.gameAttributes) {
    return q;
  }

  for (const [key, value] of Object.entries(query.gameAttributes)) {
    const queryKey = `gameAttributes.${key}`;

    if (value instanceof Array) {
      q[queryKey] = handleArrayQuery(value);
    } else if (typeof value === "object") {
      q[queryKey] = handleComposeQuery(value);
    } else {
      q[queryKey] = value;
    }
  }

  return q;
}

function handleArrayQuery(
  value: string[]
): undefined | string | { $in: string[] } {
  if (value.length === 0) {
    return;
  }

  if (value.length === 1) {
    return value[0];
  }

  return { $in: value };
}

function handleComposeQuery(value: {
  gt?: number;
  lt?: number;
}): Filter<Document> {
  const subq: Filter<Document> = {};

  if (value.gt) {
    subq["$gte"] = value.gt;
  }

  if (value.lt) {
    subq["$lte"] = value.lt;
  }

  return subq;
}
