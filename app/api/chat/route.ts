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
    const {
      messages,
      injectError,
    }: { messages: UIMessage[]; injectError?: boolean } = await req.json();

    if (process.env.INJECT_CHAT_ROUTE_ERROR === "1" && injectError === true) {
      throw new Error("Injected chat route failure for testing");
    }

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
        // console.log("Error in streamTexts:", JSON.stringify(err));
        logger.error("chat.post.stream.error", {
          error: JSON.stringify(err),
          statusCode: (err as any)?.statusCode || "503",
          route: "/api/chat",
          method: "POST",
        });
        logAndStream("error", "chat.post.stream.error", {
          error: JSON.stringify(err),
          statusCode: (err as any)?.statusCode || "503",
          route: "/api/chat",
          method: "POST",
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
    console.log("Error in chat.post:", err);
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
