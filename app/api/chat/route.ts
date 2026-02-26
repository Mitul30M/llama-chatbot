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
      messageRole: messages?.[messages.length - 1]?.role,
      messageID: messages?.[messages.length - 1]?.id ?? "no-id",
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
      onError: (err) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error("chat.post.stream.error", {
          error: errorMessage,
        });
        logAndStream("error", "chat.post.stream.error", {
          error: errorMessage,
        });
      },
      onAbort: () => {
        logger.warn("chat.post.stream.aborted", {
          messageID: messages[messages.length - 1].id,
        });
        logAndStream("warn", "chat.post.stream.aborted", {
          messageID: messages[messages.length - 1].id,
        });
      },
      onFinish: () => {
        logger.info("chat.post.stream.completed", {
          durationMs: Date.now() - start,
          messageID: messages[messages.length - 1].id,
        });
        logAndStream("info", "chat.post.stream.completed", {
          durationMs: Date.now() - start,
          messageID: messages[messages.length - 1].id,
        });
      },
    });
    return result.toUIMessageStreamResponse();
  } catch (err) {
    // log error and rethrow
    logger.error("chat.post.error", { error: (err as Error)?.message || err });
    // try {
    await logAndStream("error", "chat.post.error", {
      error: (err as Error)?.message || String(err),
    });

    return new Response(
      JSON.stringify({
        error: "An error occurred while processing the chat.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
    //   } catch (_) {}
    //   throw err;
    // }
  }
}
