"use client"

import { useState, useRef, useCallback } from "react"
import type { VideoJob } from "@/lib/types"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEditorStore } from "./use-editor-store"

export function useVideoGeneration() {
  const [job, setJob] = useState<VideoJob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { template } = useEditorStore()
  const saveVideo = useMutation(api.videos.saveVideo)
  const updateVideoStatus = useMutation(api.videos.updateVideoStatus)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const generateVideo = useCallback(
    async (
      imageDataUrl: string,
      options?: {
        prompt?: string
        duration?: number
        resolution?: string
        promptOptimizer?: boolean
      }
    ) => {
      setError(null)
      setJob(null)
      setIsGenerating(true)

      try {
        const res = await fetch("/api/video/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageDataUrl,
            prompt: options?.prompt,
            duration: options?.duration,
            resolution: options?.resolution,
            promptOptimizer: options?.promptOptimizer,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to start video generation")
        }

        const { predictionId } = data as { predictionId: string }

        const initialJob: VideoJob = { id: predictionId, status: "starting" }
        setJob(initialJob)

        saveVideo({
          templateId: template?.id ?? "unknown",
          templateName: template?.name ?? "Unknown",
          predictionId,
          prompt: options?.prompt ?? "Animate this meme",
          status: "starting",
        }).catch(() => {/* not critical */})

        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/video/status/${predictionId}`)
            const statusData: VideoJob = await statusRes.json()
            setJob(statusData)

            if (statusData.status === "succeeded" || statusData.status === "failed") {
              stopPolling()
              setIsGenerating(false)
              updateVideoStatus({
                predictionId,
                status: statusData.status,
                outputUrl: statusData.outputUrl,
                errorMessage: statusData.errorMessage,
              }).catch(() => {/* not critical */})
              if (statusData.status === "failed") {
                setError(
                  statusData.errorMessage?.trim() ||
                    "Video generation failed. Please try again."
                )
              }
            }
          } catch {
            stopPolling()
            setIsGenerating(false)
            setError("Failed to check video status.")
          }
        }, 2000)
      } catch (err) {
        setIsGenerating(false)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    },
    [template, saveVideo, updateVideoStatus]
  )

  function reset() {
    stopPolling()
    setJob(null)
    setIsGenerating(false)
    setError(null)
  }

  return { job, isGenerating, error, generateVideo, reset }
}
