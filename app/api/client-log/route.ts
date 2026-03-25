import { logAndStream, logger } from "@/lib/logger";

type ClientLogLevel = "info" | "warn" | "error";

export async function POST(req: Request) {
  try {
    const {
      level,
      event,
      meta,
    }: {
      level?: ClientLogLevel;
      event?: string;
      meta?: Record<string, unknown>;
    } = await req.json();

    const resolvedLevel: ClientLogLevel =
      level === "warn" || level === "error" ? level : "info";

    const message = event?.trim() ? event : "client.event";

    (logger as any)[resolvedLevel]?.(message, meta ?? {});
    await logAndStream(resolvedLevel, message, {
      source: "client-ui",
      ...(meta ?? {}),
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    logger.error("client.log.route.error", {
      error: err instanceof Error ? err.message : String(err),
    });

    return new Response(null, { status: 204 });
  }
}
