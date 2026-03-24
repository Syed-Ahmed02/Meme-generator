"use client"

import { useChat } from "ai/react"
import { useEffect, useRef } from "react"
import { useEditorStore } from "./use-editor-store"

export function useAiChat() {
  const { layers, updateLayer, template } = useEditorStore()
  const lastAssistantId = useRef<string | null>(null)

  const chat = useChat({
    api: "/api/ai/generate",
    onError: (err) => console.error("AI chat error:", err),
  })

  // Watch for completed assistant messages and apply to canvas
  useEffect(() => {
    const messages = chat.messages
    if (messages.length === 0) return

    const last = messages[messages.length - 1]
    if (last.role !== "assistant") return
    if (last.id === lastAssistantId.current) return
    if (chat.isLoading) return // wait until streaming is done

    lastAssistantId.current = last.id

    try {
      // Find JSON in the response (model sometimes wraps in markdown)
      const jsonMatch = last.content.match(/\{[\s\S]*"topText"[\s\S]*\}/)
      if (!jsonMatch) return

      const parsed = JSON.parse(jsonMatch[0]) as {
        topText?: string
        bottomText?: string
      }

      if (parsed.topText !== undefined && layers[0]) {
        updateLayer(layers[0].id, { text: parsed.topText })
      }
      if (parsed.bottomText !== undefined && layers[1]) {
        updateLayer(layers[1].id, { text: parsed.bottomText })
      }
    } catch {
      // JSON parse failed, skip silently
    }
  }, [chat.messages, chat.isLoading, layers, updateLayer])

  function sendMessage(content: string) {
    const systemContext = template
      ? `The user is editing a "${template.name}" meme template.`
      : ""
    chat.append({
      role: "user",
      content: systemContext ? `${systemContext}\n\n${content}` : content,
    })
  }

  return {
    messages: chat.messages,
    input: chat.input,
    setInput: chat.setInput,
    isLoading: chat.isLoading,
    sendMessage,
  }
}
