"use client"

import { useRef } from "react"
import { Paperclip, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MemeChatInputProps {
  input: string
  setInput: (v: string) => void
  imageFile: File | null
  setImageFile: (f: File | null) => void
  onSend: () => void
  isLoading: boolean
}

export function MemeChatInput({
  input,
  setInput,
  imageFile,
  setImageFile,
  onSend,
  isLoading,
}: MemeChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    e.target.value = ""
  }

  const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : null

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm p-3">
      {/* Image preview */}
      {imageFile && imagePreviewUrl && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreviewUrl}
              alt="attachment"
              className="h-16 w-16 object-cover rounded-lg border border-border"
            />
            <button
              onClick={() => setImageFile(null)}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {imageFile.name}
          </span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Attach image"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Textarea */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your situation… e.g. 'my coworker took my lunch again'"
          disabled={isLoading}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:opacity-50 min-h-[36px] max-h-[120px] overflow-y-auto"
          )}
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />

        {/* Send */}
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onSend}
          disabled={isLoading || (!input.trim() && !imageFile)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground mt-2 animate-pulse pl-11">
          Finding the perfect meme…
        </p>
      )}
    </div>
  )
}
