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

export function useChatWithTools(options: { api: string }) {
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

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const toolInvocations: ToolInvocation[] = [];
        let assistantContent = "";
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
        }

        buffer += decoder.decode();

        console.log("📦 Raw Buffer:", buffer.substring(0, 200));

        const lines = buffer.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const colonIdx = trimmed.indexOf(":");
          if (colonIdx === -1) continue;

          const code = trimmed.substring(0, colonIdx);
          const data = trimmed.substring(colonIdx + 1);

          console.log(`📝 Code: ${code}, Data: ${data.substring(0, 60)}`);

          if (code === "0") {
            try {
              let text = "";

              // parsing as JSON string
              if (data.startsWith('"')) {
                try {
                  text = JSON.parse(data);
                } catch (e) {
                  text = data.replace(/^"|"$/g, "");
                }
              } else {
                text = data;
              }

              // Unescape special characters
              text = text
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/\\r/g, "\r")
                .replace(/\\\\/g, "\\")
                .replace(/\\"/g, '"');

              assistantContent += text;
              console.log("✅ Added:", text.substring(0, 80));
            } catch (e) {
              console.error("Error parsing text:", e, "Data:", data);
              assistantContent += data;
            }
          } else if (code === "9") {
            try {
              const toolCall = JSON.parse(data);
              toolInvocations.push({
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                args: toolCall.args,
              });
              console.log("🔧 Tool:", toolCall.toolName);
            } catch (e) {
              console.error("Error parsing tool call:", e);
            }
          } else if (code === "a") {
            try {
              const result = JSON.parse(data);
              const toolInv = toolInvocations.find(
                (t) => t.toolCallId === result.toolCallId
              );
              if (toolInv) {
                toolInv.result = result.result;
                console.log("📦 Result for:", toolInv.toolName);
              }
            } catch (e) {
              console.error("Error parsing tool result:", e);
            }
          }
        }

        // console.log("✅ FINAL LENGTH:", assistantContent.length);
        // console.log("✅ FINAL CONTENT:", assistantContent.substring(0, 150));

        const assistantMessage: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: assistantContent.trim() || "I'm here to help!",
          toolInvocations:
            toolInvocations.length > 0 ? toolInvocations : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
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
