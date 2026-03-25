import Redis from "ioredis";
import { logAndStream, logger } from "@/lib/logger";

const APP_LOGS_REDIS_URL =
  process.env.APP_LOGS_REDIS_URL || "redis://127.0.0.1:6399";

export async function GET() {
  const start = Date.now();
  const redis = new Redis(APP_LOGS_REDIS_URL, {
    connectTimeout: 1500,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  try {
    await redis.connect();
    const entries = await redis.xrevrange("app-logs", "+", "-", "COUNT", 100);

    await logAndStream("info", "app.logs.fetch.success", {
      count: entries.length,
      durationMs: Date.now() - start,
      route: "/api/app-logs",
      method: "GET",
    });

    return new Response(
      JSON.stringify({
        stream: "app-logs",
        count: entries.length,
        entries,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    logger.error("app.logs.fetch.error", {
      error: message,
      route: "/api/app-logs",
      method: "GET",
      redisUrl: APP_LOGS_REDIS_URL,
      durationMs: Date.now() - start,
    });

    await logAndStream("error", "app.logs.fetch.error", {
      error: message,
      route: "/api/app-logs",
      method: "GET",
      redisUrl: APP_LOGS_REDIS_URL,
      durationMs: Date.now() - start,
    });

    return new Response(
      JSON.stringify({
        error: "Failed to fetch app logs from Redis stream.",
        reason: message,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    redis.disconnect();
  }
}
