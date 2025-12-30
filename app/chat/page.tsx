"use client";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputMessage,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Bot, User, CupSoda, Copy, Check } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getBothPlaceholders } from "@/lib/bot-utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ConversationDemo = () => {
  const { messages, sendMessage, status, stop } = useChat();
  const { placeholder, loadingState } = useMemo(
    () => getBothPlaceholders(),
    []
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleSubmit = (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (message.text.trim()) {
      sendMessage({ text: message.text });
    }
  };

  const handleCopy = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans dark:bg-black p-0">
      <main className="flex w-full  flex-col items-center gap-10 bg-white py-2 px-16  dark:bg-black sm:items-start">
        <div className="max-w-4xl   mx-auto p-4 self-center relative size-full rounded-lg border dark:border-stone-700">
          <div className="flex flex-row gap-4">
            <Link
              className="w-fit flex items-center text-stone-500 dark:text-stone-300 dark:hover:text-stone-100 text-sm hover:font-medium hover:text-stone-900 hover:underline"
              href="/"
            >
              Back
            </Link>
            <ModeToggle />
          </div>
          <div className="flex flex-col h-[650px]">
            <Conversation>
              <ConversationContent>
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    icon={
                      <CupSoda className="size-12 text-stone-900 dark:text-stone-100" />
                    }
                    title={placeholder}
                    description="Type a message below to begin chatting with the llm"
                  />
                ) : (
                  <>
                    {messages.map((message) => {
                      const messageText = message.parts
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join("");
                      const isCopied = copiedMessageId === message.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 w-full max-w-[95%] ${
                            message.role === "user"
                              ? "ml-auto flex-row-reverse"
                              : ""
                          }`}
                        >
                          <div
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="size-4 font-semibold" />
                            ) : (
                              <Bot className="size-4 font-semibold" />
                            )}
                          </div>
                          <Message from={message.role} className="flex-1">
                            <MessageContent>
                              {message.parts.map((part, i) => {
                                switch (part.type) {
                                  case "text":
                                    return (
                                      <MessageResponse
                                        key={`${message.id}-${i}`}
                                      >
                                        {part.text}
                                      </MessageResponse>
                                    );
                                  default:
                                    return null;
                                }
                              })}
                            </MessageContent>
                            {message.role === "assistant" && messageText && (
                              <div className="mt-2 flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={() =>
                                          handleCopy(message.id, messageText)
                                        }
                                        className="h-6 w-6"
                                      >
                                        {isCopied ? (
                                          <Check className="size-3" />
                                        ) : (
                                          <Copy className="size-3" />
                                        )}
                                        <span className="sr-only">
                                          {isCopied
                                            ? "Copied!"
                                            : "Copy message"}
                                        </span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {isCopied ? "Copied!" : "Copy message"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </Message>
                        </div>
                      );
                    })}
                    {status === "submitted" && (
                      <div className="flex items-start gap-3 w-full max-w-[95%]">
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                          <Bot className="size-4" />
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                          {loadingState}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            <div className="mt-4 w-full max-w-2xl mx-auto relative">
              <PromptInput onSubmit={handleSubmit} className="w-full relative">
                <PromptInputTextarea
                  placeholder="Talk to me, Goose."
                  className="pr-12"
                  disabled={isLoading}
                />
                <PromptInputSubmit
                  variant={"outline"}
                  status={
                    isStreaming
                      ? "streaming"
                      : status === "submitted"
                      ? "submitted"
                      : "ready"
                  }
                  className={"absolute right-4 hover:cursor-pointer"}
                  type={isStreaming ? "button" : "submit"}
                  onClick={(e) => {
                    if (isStreaming) {
                      e.preventDefault();
                      stop();
                    }
                  }}
                />
              </PromptInput>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ConversationDemo;
