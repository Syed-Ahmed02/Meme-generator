"use client"

import { useEffect, useRef, useState } from "react"
import { Laugh } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatSessionsSidebar } from "./chat-sessions-sidebar"
import { MemeChatMessageComponent } from "./meme-chat-message"
import { MemeChatInput } from "./meme-chat-input"
import { useMemeChat } from "@/hooks/use-meme-chat"
import type { Id } from "@/convex/_generated/dataModel"

export function MemeChatClient() {
  const [sessionId, setSessionId] = useState<Id<"meme_chat_sessions"> | null>(null)

  const {
    messages,
    isLoading,
    error,
    input,
    setInput,
    imageFile,
    setImageFile,
    sendMessage,
    currentSessionId,
    clearError,
  } = useMemeChat(sessionId)

  // Sync new session IDs created inside the hook back to local state
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      setSessionId(currentSessionId)
    }
  }, [currentSessionId, sessionId])

  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSelectSession(id: Id<"meme_chat_sessions">) {
    setSessionId(id)
  }

  function handleNewSession() {
    setSessionId(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSessionsSidebar
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Laugh className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-base tracking-tight">MemeForge</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Meme Chat</span>
          </div>
          <UserButton />
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <Laugh className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-base font-medium mb-2">Tell me what&apos;s on your mind</p>
                <p className="text-sm">
                  I&apos;ll find the perfect meme for the occasion.
                  <br />
                  You can also attach an image for extra context.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {[
                    "My code works but I don't know why",
                    "It's Monday morning again",
                    "My boss scheduled a meeting that could've been an email",
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setInput(example)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <MemeChatMessageComponent key={msg._id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex gap-2 mb-4">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-1">
                  AI
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between">
                <span>{error}</span>
                <button onClick={clearError} className="text-xs underline ml-4">
                  Dismiss
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <MemeChatInput
          input={input}
          setInput={setInput}
          imageFile={imageFile}
          setImageFile={setImageFile}
          onSend={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
