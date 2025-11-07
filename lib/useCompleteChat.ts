import { useState, useCallback } from "react";
import { nanoid } from "nanoid";

export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args?: any;
  result?: any;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

export function useCompleteChat(options: { api: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const append = useCallback(
    async (message: { role: "user" | "assistant"; content: string }) => {
      const userMessage: ChatMessage = {
        id: nanoid(),
        role: message.role as "user" | "assistant",
        content: message.content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch(options.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            model: "gemini-2.0-flash",
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("📦 API Response:", data);

        // Parse tool results into toolInvocations format
        const toolInvocations: ToolInvocation[] = [];
        if (data.toolResults) {
          data.toolResults.forEach((result: any) => {
            toolInvocations.push({
              toolCallId: result.toolCallId || nanoid(),
              toolName: result.toolName,
              args: result.args,
              result: result.result,
            });
          });
        }

        const assistantMessage: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: data.content || "I'm here to help!",
          toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
        };

        // console.log("✅ Final message:", assistantMessage.content.substring(0, 100));
        // console.log("🔧 Tool invocations:", toolInvocations.length);

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const reload = useCallback(() => {
    if (messages.length === 0) return;
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      setMessages((prev) => prev.slice(0, -1));
      append({ role: "user", content: lastUserMessage.content });
    }
  }, [messages, append]);

  return { messages, append, isLoading, reload };
}