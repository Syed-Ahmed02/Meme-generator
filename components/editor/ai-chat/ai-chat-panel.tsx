"use client"

import { useEffect, useRef } from "react"
import { Bot, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { useAiChat } from "@/hooks/use-ai-chat"

export function AiChatPanel() {
  const { messages, input, setInput, isLoading, sendMessage } = useAiChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header tip */}
      <div className="px-3 py-2.5 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Describe your meme — AI will write the top &amp; bottom text for you</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
            <div className="p-3 rounded-full bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">AI Meme Generator</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try: &quot;drake meme about writing unit tests&quot;
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role as "user" | "assistant"}
              content={msg.content}
              isStreaming={isLoading && msg === messages[messages.length - 1] && msg.role === "assistant"}
            />
          ))
        )}
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => {
          if (input.trim()) sendMessage(input)
        }}
        disabled={isLoading}
      />
    </div>
  )
}
