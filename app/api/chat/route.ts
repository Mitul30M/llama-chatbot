import {
  streamText,
  UIMessage,
  convertToModelMessages,
  generateText,
} from "ai";
import { ollama } from "ai-sdk-ollama";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: ollama("llama3.2"),
    system:'You are an assistant who answers user queries',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

