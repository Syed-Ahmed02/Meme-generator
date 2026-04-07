"use client"

import { MessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface ChatSessionsSidebarProps {
  activeSessionId: Id<"meme_chat_sessions"> | null
  onSelectSession: (id: Id<"meme_chat_sessions">) => void
  onNewSession: () => void
}

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ChatSessionsSidebar({
  activeSessionId,
  onSelectSession,
  onNewSession,
}: ChatSessionsSidebarProps) {
  const sessions = useQuery(api.memeChat.listSessions)

  return (
    <aside className="w-56 border-r border-border bg-card/50 flex flex-col shrink-0">
      <div className="p-3 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 justify-start"
          onClick={onNewSession}
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions === undefined && (
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}
          {sessions?.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No chats yet</p>
          )}
          {sessions?.map((session) => (
            <button
              key={session._id}
              onClick={() => onSelectSession(session._id)}
              className={cn(
                "w-full text-left rounded-lg px-3 py-2.5 transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeSessionId === session._id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <p className="text-xs font-medium truncate text-foreground">{session.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {relativeTime(session.updatedAt)}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
