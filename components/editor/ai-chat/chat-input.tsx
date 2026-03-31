"use client"

import { KeyboardEvent } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  value?: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function ChatInput({
  value = "",
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border min-h-0">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your meme… e.g. 'drake meme about TypeScript errors'"
        disabled={disabled}
        className="field-sizing-content min-h-11 max-h-24 w-full min-w-0 flex-1 resize-none overflow-y-auto rounded-lg border border-input bg-background px-3 py-2 text-sm leading-normal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
      />
      <Button
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
