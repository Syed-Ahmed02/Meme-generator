"use client"

import { useRef, KeyboardEvent } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSubmit()
    }
  }

  function handleInput() {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 96) + "px"
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => { onChange(e.target.value); handleInput() }}
        onKeyDown={handleKeyDown}
        placeholder="Describe your meme… e.g. 'drake meme about TypeScript errors'"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 min-h-9 max-h-24"
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
