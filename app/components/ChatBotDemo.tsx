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

  const mapToolPayload = (toolName: string, payload: any): ToolData | null => {
    if (!payload) return null;
    switch (toolName) {
      case "showMap":
        return { type: "map", data: payload };
      case "showIphoneSalesGraph":
        return { type: "sales", data: payload };
      case "getRecipe":
        return { type: "recipe", data: payload };
      case "showDietChart":
        return { type: "diet", data: payload };
      case "getWeather":
        return { type: "weather", data: payload };
      case "findProduct":
        return { type: "product", data: payload };
      case "getStockPrice":
        return { type: "stock", data: payload };
      case "findVideo":
        return { type: "video", data: payload };
      case "showImagePlaceholder":
        return { type: "image", data: payload };
      case "showUserProfile":
        return { type: "profile", data: payload };
      default:
        return null;
    }
  };

  const buildToolData = (message: any): [ToolData | null, any | null] => {
    const parts = message?.parts ?? [];
    let finalToolData: ToolData | null = null;
    let debugPayload: any = null;

    try {
      if (Array.isArray(message?.toolInvocations)) {
        for (const invocation of message.toolInvocations) {
          const toolName =
            invocation?.toolName ?? invocation?.name ?? invocation?.tool;
          if (!toolName) continue;

          const payload =
            invocation?.result ??
            invocation?.output ??
            invocation?.data ??
            invocation?.input ??
            invocation?.arguments ??
            invocation?.toolInput;

          const converted = mapToolPayload(toolName, payload);
          if (converted) {
            finalToolData = converted;
            debugPayload = {
              tool: toolName,
              input: payload,
              source: "toolInvocations",
            };
            return [finalToolData, debugPayload];
          }
        }
      }

      const toolInputPart = parts.find(
        (part: any) => part.type === "tool-input-available"
      ) as any;

      if (toolInputPart) {
        finalToolData = mapToolPayload(
          toolInputPart.toolName,
          toolInputPart.input
        );
        if (finalToolData) {
          debugPayload = {
            tool: toolInputPart.toolName,
            input: toolInputPart.input,
            source: "tool-input-available",
          };
          return [finalToolData, debugPayload];
        }
      }

      const toolCallPart = parts.find(
        (part: any) => part.type === "tool-call"
      ) as any;
      if (toolCallPart) {
        finalToolData = mapToolPayload(toolCallPart.toolName, toolCallPart.input);
        if (finalToolData) {
          debugPayload = {
            tool: toolCallPart.toolName,
            input: toolCallPart.input,
            source: "tool-call",
          };
          return [finalToolData, debugPayload];
        }
      }

      const toolInputStart = parts.find(
        (p: any) => p.type === "tool-input-start"
      ) as any;
      const deltas = parts.filter((p: any) => p.type === "tool-input-delta");

      if (toolInputStart && deltas.length) {
        const toolName = toolInputStart.toolName;
        const joined = deltas
          .map((p: any) => p.inputTextDelta ?? p.textDelta ?? p.delta ?? "")
          .join("");

        try {
          const inputObject = JSON.parse(joined);
          finalToolData = mapToolPayload(toolName, inputObject);
          if (finalToolData) {
            debugPayload = {
              tool: toolName,
              input: inputObject,
              source: "tool-input-delta",
            };
            return [finalToolData, debugPayload];
          }
        } catch {
          debugPayload = { tool: toolName, streaming: joined };
        }
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
              // --- AGGREGATE TEXT ---
              const textContent = message.parts
                .filter(
                  (part: any) =>
                    part.type === "text" || part.type === "text-delta"
                )
                .map((part: any) => part.text ?? part.textDelta ?? "")
                .join("");

              const [finalToolData, assembledToolPayload] =
                buildToolData(message);

              console.debug("TOOL DEBUG (FrontEnd)", {
                messageId: message.id,
                "Render Hoga?": finalToolData ? "HAAN" : "NAHI",
                finalToolData,
                assembledToolPayload,
                parts: message.parts,
                toolInvocations: (message as any).toolInvocations,
              });

              const lastAssistantMessageId = [...messages]
                .reverse()
                .find((m: any) => m.role === "assistant")?.id;
              const isLatestAssistantMessage =
                message.role === "assistant" &&
                message.id === lastAssistantMessageId;

              return (
                <div key={message.id}>
                  {/* Render text content */}
                  {textContent && (
                    <Message from={message.role} className="overflow-visible">
                      <MessageContent className="overflow-visible">
                        <Response>{textContent}</Response>
                      </MessageContent>
                    </Message>
                  )}

                  {/* Render actions (copy/retry) */}
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
