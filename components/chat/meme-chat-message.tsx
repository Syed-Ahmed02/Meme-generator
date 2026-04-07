"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MemeChatMessage } from "@/lib/types"

const MiniMemeCanvas = dynamic(
  () => import("./mini-meme-canvas").then((m) => m.MiniMemeCanvas),
  { ssr: false, loading: () => <div className="rounded-lg bg-muted animate-pulse h-48 w-80" /> }
)

interface MemeChatMessageProps {
  message: MemeChatMessage
}

export function MemeChatMessageComponent({ message }: MemeChatMessageProps) {
  const router = useRouter()
  const isUser = message.role === "user"

  function openInEditor() {
    if (!message.memeResult) return
    const { templateId, topText, bottomText } = message.memeResult
    const params = new URLSearchParams({ topText, bottomText })
    router.push(`/editor/${templateId}?${params.toString()}`)
  }

  return (
    <div className={cn("flex gap-2 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar dot */}
      <div
        className={cn(
          "shrink-0 mt-1 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? "U" : "AI"}
      </div>

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        {/* Text bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {message.content}
          {message.imageDescription && (
            <p className="mt-1 text-xs opacity-60 italic">
              Image: {message.imageDescription.slice(0, 80)}…
            </p>
          )}
        </div>

        {/* Meme card */}
        {message.memeResult && (
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <MiniMemeCanvas
              templateUrl={message.memeResult.templateUrl}
              templateWidth={message.memeResult.templateWidth}
              templateHeight={message.memeResult.templateHeight}
              topText={message.memeResult.topText}
              bottomText={message.memeResult.bottomText}
              maxWidth={320}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
              <span className="text-xs text-muted-foreground truncate">
                {message.memeResult.templateName}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1.5 shrink-0"
                onClick={openInEditor}
              >
                <ExternalLink className="h-3 w-3" />
                Edit in Editor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
