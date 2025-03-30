import { Document, Filter } from "mongodb";
import { CardQuery } from "../models/card.js";

export function buildCardDbQuery(query: CardQuery): Filter<Document> {
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
    q["rarity"] = handleArrayQuery(q, "rarity", query.rarity);
  }

  if (query.game) {
    q["game"] = query.game;
  }

  if (query.gameAttributes) {
    for (const [key, value] of Object.entries(query.gameAttributes)) {
      const queryKey = `gameAttributes.${key}`;

      if (Array.isArray(value)) {
        handleArrayQuery(q, queryKey, value);
      } else if (typeof value === "object") {
        handleNumericQuery(q, queryKey, value);
      } else {
        q[queryKey] = value;
      }
    }
  }

  return q;
}

function handleArrayQuery(
  q: { [key: string]: any },
  key: string,
  value: any[]
) {
  if (value.length === 0) {
    return;
  }

  if (value.length === 1) {
    return (q[key] = value[0]);
  }

  q[key] = { $in: value };
}

function handleNumericQuery(
  q: { [key: string]: any },
  key: string,
  value: any
) {
  const subq: { [key: string]: any } = {};

  if (value.gt) {
    subq["$gte"] = value.gt;
  }

  if (value.lt) {
    subq["$lte"] = value.lt;
  }

  q[key] = subq;
}
