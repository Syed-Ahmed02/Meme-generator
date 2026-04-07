"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { nanoid } from "nanoid"
import type { Id } from "@/convex/_generated/dataModel"
import type { MemeChatMessage, MemeResult } from "@/lib/types"

function compressImageToBase64(file: File, maxDim = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.7))
    }
    img.onerror = reject
    img.src = url
  })
}

export function useMemeChat(initialSessionId: string | null) {
  const [sessionId, setSessionId] = useState<Id<"meme_chat_sessions"> | null>(
    initialSessionId as Id<"meme_chat_sessions"> | null
  )
  const [localMessages, setLocalMessages] = useState<MemeChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const sessionCreatingRef = useRef<Promise<Id<"meme_chat_sessions">> | null>(null)

  const createSession = useMutation(api.memeChat.createSession)
  const addMessage = useMutation(api.memeChat.addMessage)
  const touchSession = useMutation(api.memeChat.touchSession)

  const persistedMessages = useQuery(
    api.memeChat.getMessages,
    sessionId ? { sessionId } : "skip"
  )

  // Sync persisted messages into local state on mount / session switch
  useEffect(() => {
    if (!persistedMessages) return
    const mapped: MemeChatMessage[] = persistedMessages.map((m) => ({
      _id: m._id,
      sessionId: m.sessionId,
      role: m.role,
      content: m.content,
      imageDescription: m.imageDescription,
      memeResult: m.memeResult as MemeResult | undefined,
      createdAt: m.createdAt,
    }))
    setLocalMessages(mapped)
  }, [persistedMessages])

  const resolveSession = useCallback(
    async (firstMessage: string): Promise<Id<"meme_chat_sessions">> => {
      if (sessionId) return sessionId

      // Guard against race conditions on rapid sends
      if (sessionCreatingRef.current) return sessionCreatingRef.current

      const p = createSession({ title: firstMessage.slice(0, 60) })
      sessionCreatingRef.current = p
      const newId = await p
      sessionCreatingRef.current = null
      setSessionId(newId)
      return newId
    },
    [sessionId, createSession]
  )

  const sendMessage = useCallback(async () => {
    if (isLoading || !input.trim()) return
    const text = input.trim()
    setIsLoading(true)
    setError(null)
    setInput("")

    // Optimistic user message
    const tempId = nanoid()
    const optimisticUser: MemeChatMessage = {
      _id: tempId,
      sessionId: sessionId ?? "",
      role: "user",
      content: text,
      createdAt: Date.now(),
    }
    setLocalMessages((prev) => [...prev, optimisticUser])

    try {
      // OCR if image attached
      let imageDescription = ""
      let capturedFile: File | null = null
      if (imageFile) {
        capturedFile = imageFile
        setImageFile(null)
        try {
          const base64 = await compressImageToBase64(capturedFile)
          const ocrRes = await fetch("/api/chat/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          })
          if (ocrRes.ok) {
            const ocrData = await ocrRes.json()
            imageDescription = ocrData.description ?? ""
          }
        } catch {
          // OCR failure is non-fatal
        }
      }

      // Build conversation history from current local messages (last 6)
      const history = localMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: text, imageDescription, conversationHistory: history }),
      })

      if (!chatRes.ok) {
        const data = await chatRes.json()
        throw new Error(data.error ?? "Chat request failed")
      }

      const data = await chatRes.json()
      const { replyText, memeResult } = data as { replyText: string; memeResult: MemeResult }

      // Resolve / create session
      const sid = await resolveSession(text)

      // Persist user message
      await addMessage({
        sessionId: sid,
        role: "user",
        content: text,
        imageDescription: imageDescription || undefined,
      })

      // Persist assistant message
      await addMessage({
        sessionId: sid,
        role: "assistant",
        content: replyText,
        memeResult,
      })

      await touchSession({ sessionId: sid })

      // Append assistant message optimistically
      const assistantMsg: MemeChatMessage = {
        _id: nanoid(),
        sessionId: sid,
        role: "assistant",
        content: replyText,
        memeResult,
        createdAt: Date.now(),
      }
      setLocalMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      // Remove optimistic user message on failure
      setLocalMessages((prev) => prev.filter((m) => m._id !== tempId))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, input, imageFile, sessionId, localMessages, resolveSession, addMessage, touchSession])

  return {
    messages: localMessages,
    isLoading,
    error,
    input,
    setInput,
    imageFile,
    setImageFile,
    sendMessage,
    currentSessionId: sessionId,
    clearError: () => setError(null),
  }
}
