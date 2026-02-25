import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const client = new Redis(REDIS_URL);

client.on("error", (err) => {
  // keep lightweight — avoid throwing during import
  // consumers can check client.status or catch errors
  // eslint-disable-next-line no-console
  if (err instanceof Error) {
    console.warn("Redis client error:", err.message);
  } else {
    console.warn("Redis client error:", err);
  }
});

export async function pushLogToStream(streamName: string, data: Record<string, string>) {
  try {
    const entries: string[] = [];
    for (const [k, v] of Object.entries(data)) {
      entries.push(k, String(v));
    }
    // XADD stream * field value [field value ...]
    return await client.xadd(streamName, "*", ...entries);
  } catch (err) {
    // eslint-disable-next-line no-console
    if (err instanceof Error) {
      console.warn("pushLogToStream failed:", err.message);
    } else {
      console.warn("pushLogToStream failed:", err);
    }
    return null;
  }
}

export async function publish(channel: string, message: string) {
  try {
    return await client.publish(channel, message);
  } catch (err) {
    // eslint-disable-next-line no-console
    if (err instanceof Error) {
      console.warn("publish failed:", err.message);
    } else {
      console.warn("publish failed:", err);
    }
    return null;
  }
}

export function getRedisClient() {
  return client;
}

export default client;
