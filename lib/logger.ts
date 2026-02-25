import fs from "fs";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { pushLogToStream } from "./redis";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    if (e instanceof Error) {
      console.warn("Could not create log directory:", e.message);
    } else {
      console.warn("Could not create log directory:", e);
    }
  }
}

const rotateTransport = new DailyRotateFile({
  dirname: logDir,
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "1d",
  zippedArchive: false,
  level: "info",
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    rotateTransport,
  ],
  exitOnError: false,
});

async function logAndStream(level: string, message: string, meta?: Record<string, unknown>) {
  // Log locally
  (logger as any)[level]?.(message, meta ?? {});

  // Stream to Redis (best-effort)
  try {
    await pushLogToStream("app-logs", {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta: meta ? JSON.stringify(meta) : "{}",
    });
  } catch (e) {
    // swallow — don't break app if Redis isn't available
  }
}

export { logger, logAndStream };
export default logger;
