import {
  streamText,
  UIMessage,
  convertToModelMessages,
  // generateText,
} from "ai";
import { ollama as defaultOllama, createOllama } from "ai-sdk-ollama";
import { logAndStream, logger } from "../../../lib/logger";

export async function POST(req: Request) {
  const start = Date.now();
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    await logAndStream("info", "chat.post.received", {
      messageCount: messages?.length ?? 0,
    });

    const ollamaProvider =
      process.env.OLLAMA_BASE_URL || process.env.OLLAMA_API_KEY
        ? createOllama({
            baseURL: process.env.OLLAMA_BASE_URL,
            apiKey: process.env.OLLAMA_API_KEY,
          })
        : defaultOllama;

    const result = streamText({
      model: ollamaProvider("gpt-oss:120b-cloud"),
      system: "You are an assistant who answers user queries",
      messages: await convertToModelMessages(messages),
    });

    // note: stream will be returned directly; log the completion after stream created
    await logAndStream("info", "chat.post.started", {
      durationMs: Date.now() - start,
    });
    return result.toUIMessageStreamResponse();
  } catch (err) {
    // log error and rethrow
    logger.error("chat.post.error", { error: (err as Error)?.message || err });
    try {
      await logAndStream("error", "chat.post.error", {
        error: (err as Error)?.message || String(err),
      });
    } catch (_) {}
    throw err;
  }
}
