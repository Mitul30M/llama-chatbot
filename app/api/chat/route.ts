import { streamText, UIMessage, convertToModelMessages } from "ai";
import { ollama } from "ai-sdk-ollama";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: ollama("llama3.2"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
