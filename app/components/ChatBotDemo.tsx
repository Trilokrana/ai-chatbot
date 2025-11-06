"use client";

import { useState } from "react";
import { useCompleteChat } from "@/lib/useCompleteChat";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputHeader,
} from "@/components/ai-elements/prompt-input";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import { Loader } from "@/components/ai-elements/loader";
import { Toaster, toast } from "sonner";
import type { ToolData } from "@/lib/types";
import ToolRenderer from "@/app/components/ToolRenderer";

const models = [
  { name: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
  { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
];

const ChatBotDemo = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);

  const { messages, append, isLoading, reload } = useCompleteChat({
    api: "/api/chat",
  });

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;

    await append({
      role: "user",
      content: message.text,
    });

    setInput("");
  };

  const getToolData = (message: any): ToolData | null => {
    if (!message.toolInvocations?.length) return null;

    for (const invocation of message.toolInvocations) {
      if (invocation.result) {
        const typeMap: Record<string, ToolData["type"]> = {
          weather: "weather",
          product: "product",
          recipe: "recipe",
          iphoneSales: "sales",
          diet: "diet",
          stock: "stock",
          map: "map",
        };

        const type = typeMap[invocation.toolName];
        if (type) {
          return { type, data: invocation.result };
        }
      }
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 relative h-screen">
      <div className="flex flex-col h-screen">
        <Conversation className="flex-1">
          <ConversationContent className="overflow-auto pb-2">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-lg">Start a conversation...</p>
              </div>
            ) : (
              messages.map((message) => {
                const toolData = getToolData(message);
                const lastAssistantId = [...messages]
                  .reverse()
                  .find((m) => m.role === "assistant")?.id;
                const isLatestAssistant =
                  message.role === "assistant" &&
                  message.id === lastAssistantId;

                return (
                  <div key={message.id} className="mb-4">
                    {message.content && (
                      <Message from={message.role} className="overflow-visible">
                        <MessageContent className="overflow-visible">
                          <Response>{message.content}</Response>
                        </MessageContent>
                      </Message>
                    )}

                    {isLatestAssistant && message.content && (
                      <Actions className="mt-2">
                        <Action onClick={() => reload()} label="Retry">
                          <RefreshCcwIcon className="size-3" />
                        </Action>
                        <Action
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                message.content
                              );
                              toast.success("Copied!", { duration: 1500 });
                            } catch {
                              toast.error("Failed to copy");
                            }
                          }}
                          label="Copy"
                          className="cursor-pointer"
                        >
                          <CopyIcon className="size-3" />
                        </Action>
                      </Actions>
                    )}

                    {toolData && (
                      <div className="mt-4 rounded-lg">
                        <ToolRenderer data={toolData} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {isLoading && (
              <div className="flex items-center gap-2">
                <Loader />
                <span className="text-gray-700">Generating response...</span>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-0 mb-0"
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Ask for weather, products, recipes, sales, stocks, diets..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton variant="ghost">
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect value={model} onValueChange={() => {}}>
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((m) => (
                    <PromptInputModelSelectItem key={m.value} value={m.value}>
                      {m.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input.trim() || isLoading}
              status={isLoading ? "pending" : "idle"}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default ChatBotDemo;
