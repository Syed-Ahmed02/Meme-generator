"use client"

import { useState, useRef, useCallback } from "react"
import type { VideoJob } from "@/lib/types"

export function useVideoGeneration() {
  const [job, setJob] = useState<VideoJob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const generateVideo = useCallback(async (imageDataUrl: string) => {
    setError(null)
    setJob(null)
    setIsGenerating(true)

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start video generation")
      }

      const { predictionId } = data as { predictionId: string }

      const initialJob: VideoJob = { id: predictionId, status: "starting" }
      setJob(initialJob)

      // Poll for status
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/video/status/${predictionId}`)
          const statusData: VideoJob = await statusRes.json()
          setJob(statusData)

          if (statusData.status === "succeeded" || statusData.status === "failed") {
            stopPolling()
            setIsGenerating(false)
            if (statusData.status === "failed") {
              setError("Video generation failed. Please try again.")
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
  }, [])

  function reset() {
    stopPolling()
    setJob(null)
    setIsGenerating(false)
    setError(null)
  }

  return { job, isGenerating, error, generateVideo, reset }
}
