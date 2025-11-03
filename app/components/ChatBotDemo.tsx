// src/components/ChatBotDemo.tsx
"use client";

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
import { useState } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import { Loader } from "@/components/ai-elements/loader";
import { Toaster, toast } from "sonner";
import type { ToolData } from "@/lib/types";

import { ToolRenderer } from "@/app/components/ToolRenderer";

const models = [
  { name: "Gemini 2.5 Flash", value: "google/gemini-2.5-flash" },
  { name: "GPT 4o", value: "openai/gpt-4o" },
];

const ChatBotDemo = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const { messages, sendMessage, status, regenerate } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) return;

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      { body: { model: model, webSearch: webSearch } }
    );
    setInput("");
  };


  const buildToolData = (parts: any[]): [ToolData | null, any | null] => {
    let finalToolData: ToolData | null = null;
    let debugPayload: any = null;

    try {
      const toolInputPart = parts.find(
        (part: any) => part.type === "tool-input-available"
      ) as any;

      if (toolInputPart) {
        debugPayload = {
          tool: toolInputPart.toolName,
          input: toolInputPart.input,
        };
        switch (toolInputPart.toolName) {
          case "showMap":
            finalToolData = { type: "map", data: toolInputPart.input };
            break;
          case "showIphoneSalesGraph":
            finalToolData = { type: "sales", data: toolInputPart.input };
            break;
          case "getRecipe":
            finalToolData = { type: "recipe", data: toolInputPart.input };
            break;
          case "showDietChart":
            finalToolData = { type: "diet", data: toolInputPart.input };
            break;
          case "getWeather":
            finalToolData = { type: "weather", data: toolInputPart.input };
            break;
          case "findProduct":
            finalToolData = { type: "product", data: toolInputPart.input };
            break;
          case "getStockPrice":
            finalToolData = { type: "stock", data: toolInputPart.input };
            break;
          case "findVideo":
            finalToolData = { type: "video", data: toolInputPart.input };
            break;
          case "showImagePlaceholder":
            finalToolData = { type: "image", data: toolInputPart.input };
            break;
          case "showUserProfile":
            finalToolData = { type: "profile", data: toolInputPart.input };
            break;
        }
        return [finalToolData, debugPayload];
      }
    } catch (err) {
      console.warn("Tool parsing error", err);
    }

    return [null, null]; 
  };

  return (
    <div className="max-w-4xl mx-auto p-4 relative h-screen">
      <div className="flex flex-col h-screen">
        <Conversation className="flex-1">
          <ConversationContent className="overflow-auto pb-2">
            {messages.map((message) => {
              const textContent = message.parts
                .filter(
                  (part: any) =>
                    part.type === "text" || part.type === "text-delta"
                )
                .map((part: any) => part.text ?? part.textDelta ?? "")
                .join("");

              const [finalToolData, assembledToolPayload] = buildToolData(
                message.parts
              );

              console.debug("TOOL DEBUG (FrontEnd)", {
                messageId: message.id,
                "Render Hoga?": finalToolData ? "HAAN" : "NAHI",
                finalToolData,
                assembledToolPayload,
              });

              const lastAssistantMessageId = [...messages]
                .reverse()
                .find((m: any) => m.role === "assistant")?.id;
              const isLatestAssistantMessage =
                message.role === "assistant" &&
                message.id === lastAssistantMessageId;

              return (
                <div key={message.id}>
                  {textContent && (
                    <Message from={message.role} className="overflow-visible">
                      <MessageContent className="overflow-visible">
                        <Response>{textContent}</Response>
                      </MessageContent>
                    </Message>
                  )}

                  {isLatestAssistantMessage && (
                    <Actions className="mt-2">
                      <Action onClick={() => regenerate()} label="Retry">
                        <RefreshCcwIcon className="size-3" />
                      </Action>
                      <Action
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(textContent);
                            toast.success("Copied successfully", {
                              duration: 1600,
                            });
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

                  {finalToolData ? (
                    <div className="mt-3">
                      <ToolRenderer data={finalToolData} />
                    </div>
                  ) : assembledToolPayload &&
                    !finalToolData &&
                    typeof assembledToolPayload === "object" ? (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/40 rounded border border-yellow-200 dark:border-yellow-700">
                      <strong className="block mb-2">
                        Tool payload received (unknown shape):
                      </strong>
                      <pre className="text-xs overflow-auto max-h-48">
                        {JSON.stringify(assembledToolPayload, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              );
            })}
            {status === "submitted" && <Loader />}
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
              placeholder="Ask for sales data, weather, recipes, or search the web..."
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
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
                title={webSearch ? "Disable Web Search" : "Enable Web Search"}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value: any) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input && status !== "streaming"}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default ChatBotDemo;
