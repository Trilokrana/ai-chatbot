import { useState, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";

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

export function useCustomChat(options: { api: string }) {
  const { messages: rawMessages, append: rawAppend, isLoading, reload } = useChat(options);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Parse tool invocations from the raw message content
  const parseToolData = (content: string): ToolInvocation[] => {
    const tools: ToolInvocation[] = [];
    
    // Look for tool call pattern: 9:{...}
    const toolCallPattern = /9:\{[^}]*"toolCallId":"([^"]*)"[^}]*"toolName":"([^"]*)"[^}]*\}/g;
    const matches = content.matchAll(toolCallPattern);
    
    for (const match of matches) {
      const toolCallId = match[1];
      const toolName = match[2];
      
      // Look for corresponding result: a:{...}
      const resultPattern = new RegExp(`a:\\{[^}]*"toolCallId":"${toolCallId}"[^}]*"result":(\\{[^}]*\\})[^}]*\\}`);
      const resultMatch = content.match(resultPattern);
      
      if (resultMatch) {
        try {
          const result = JSON.parse(resultMatch[1]);
          tools.push({ toolCallId, toolName, result });
        } catch (e) {
          console.error("Failed to parse tool result:", e);
        }
      } else {
        tools.push({ toolCallId, toolName });
      }
    }
    
    return tools;
  };

  // Transform raw messages to include parsed tool data
  const messages: ChatMessage[] = rawMessages.map((msg: any, idx: number) => {
    const toolInvocations = parseToolData(msg.content || "");
    
    return {
      id: msg.id || `msg-${idx}`,
      role: msg.role,
      content: msg.content || "",
      toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
    };
  });

  messagesRef.current = messages;

  const append = useCallback(
    async (message: { role: "user" | "assistant"; content: string }) => {
      return rawAppend(message);
    },
    [rawAppend]
  );

  return { messages, append, isLoading, reload };
}