"use client"

import { useChat } from "@ai-sdk/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useEditorStore } from "./use-editor-store"

function textFromUiMessage(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function uiMessageDisplayText(msg: UIMessage): string {
  return textFromUiMessage(msg)
}

export function useAiChat() {
  const { layers, updateLayer, template } = useEditorStore()
  const lastAssistantId = useRef<string | null>(null)
  const [input, setInput] = useState("")

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai/generate" }),
    []
  )

  const chat = useChat({
    transport,
    onError: (err) => console.error("AI chat error:", err),
  })

  const isLoading =
    chat.status === "submitted" || chat.status === "streaming"

  // Watch for completed assistant messages and apply to canvas
  useEffect(() => {
    const messages = chat.messages
    if (messages.length === 0) return

    const last = messages[messages.length - 1]
    if (last.role !== "assistant") return
    if (last.id === lastAssistantId.current) return
    if (isLoading) return

    lastAssistantId.current = last.id

    try {
      const text = textFromUiMessage(last)
      const jsonMatch = text.match(/\{[\s\S]*"topText"[\s\S]*\}/)
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
  }, [chat.messages, isLoading, layers, updateLayer])

  async function sendMessage(content: string) {
    const systemContext = template
      ? `The user is editing a "${template.name}" meme template.`
      : ""
    const text = systemContext ? `${systemContext}\n\n${content}` : content
    await chat.sendMessage({ text })
    setInput("")
  }

  return {
    messages: chat.messages,
    input,
    setInput,
    isLoading,
    sendMessage,
  }
}
