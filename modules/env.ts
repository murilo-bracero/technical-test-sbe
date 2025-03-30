export const appConfig = {
  port: safeParseInt(process.env.PORT, 3000),
  logLevel: process.env.LOG_LEVEL || "info",
  database: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  batch: {
    cardLoaderChunkSize: safeParseInt(process.env.CARD_LOADER_CHUNK_SIZE, 50),
  },
  api: {
    maxCardsPerRequest: safeParseInt(process.env.API_MAX_CARDS_PER_REQUEST, 50),
  },
};

function safeParseInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? fallback : parsed;
}
