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
  PromptInputSubmit
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, User, Square, UserSquare, UserSquare2, BookHeart, User2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
const ConversationDemo = () => {
  const { messages, sendMessage, status, stop } = useChat();
  const handleSubmit = (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (message.text.trim()) {
      sendMessage({ text: message.text });
    }
  };
  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  return (
    <div className="max-w-2xl mx-auto p-6 relative size-full rounded-lg border h-[800px]">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<BookHeart className="size-12" />}
                title="Start a conversation"
                description="Type a message below to begin chatting with the llm"
              />
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 w-full max-w-[95%] ${
                      message.role === "user" ? "ml-auto flex-row-reverse" : ""
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
                        <User className="size-4" />
                      ) : (
                        // <></>
                        <Bot className="size-4" />
                      )}
                    </div>
                    <Message from={message.role} className="flex-1">
                      <MessageContent>
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text": // we don't use any reasoning or tool calls in this example
                              return (
                                <MessageResponse key={`${message.id}-${i}`}>
                                  {part.text}
                                </MessageResponse>
                              );
                            default:
                              return null;
                          }
                        })}
                      </MessageContent>
                    </Message>
                  </div>
                ))}
                {status === "submitted" && (
                  <div className="flex items-start gap-3 w-full max-w-[95%]">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                      <Bot className="size-4" />
                    </div>
                    <div className="text-sm text-muted-foreground italic">
                      Hold on a sec, sipping water...
                    </div>
                  </div>
                )}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="mt-4 w-full max-w-2xl mx-auto relative">
          {isStreaming && (
            <Button
              onClick={stop}
              variant="outline"
              size="sm"
              className="absolute bottom-full mb-2 right-0"
            >
              <Square className="size-4 mr-2" />
              Stop generating
            </Button>
          )}
          <PromptInput onSubmit={handleSubmit} className="w-full relative">
            <PromptInputTextarea
              placeholder="Say something..."
              className="pr-12"
              disabled={isLoading}
            />
            <PromptInputSubmit
              status={
                isStreaming
                  ? "streaming"
                  : status === "submitted"
                  ? "submitted"
                  : "ready"
              }
              className="absolute bottom-1 right-1"
              disabled={isLoading}
            />
          </PromptInput>
        </div>
      </div>
    </div>
  );
};
export default ConversationDemo;
