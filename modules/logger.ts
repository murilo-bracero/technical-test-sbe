import { pino } from "pino";
import { appConfig } from "./env.js";

export const log = pino({
  level: appConfig.logLevel || "info",
  base: undefined,
  redact: [
    "req.headers.authorization",
    "res.headers.etag",
    "req.remoteAddress",
    "req.remotePort",
  ],
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
