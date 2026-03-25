"use client"

import { Film, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoResult } from "./video-result"
import { useVideoGeneration } from "@/hooks/use-video-generation"
import { useCanvasExport } from "@/hooks/use-canvas-export"
import type Konva from "konva"

const STATUS_LABELS: Record<string, string> = {
  starting: "Starting up...",
  processing: "Animating your meme...",
  succeeded: "Done!",
  failed: "Failed",
}

interface VideoPanelProps {
  stageRef: React.RefObject<Konva.Stage | null>
  imageLoaded: boolean
}

export function VideoPanel({ stageRef, imageLoaded }: VideoPanelProps) {
  const { job, isGenerating, error, generateVideo, reset } = useVideoGeneration()
  const { getDataUrl } = useCanvasExport(stageRef)

  async function handleGenerate() {
    const dataUrl = getDataUrl()
    if (!dataUrl) return
    await generateVideo(dataUrl)
  }

  return (
    <div className="flex flex-col h-full p-3 space-y-4">
      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs text-muted-foreground leading-relaxed">
        <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
          <Film className="h-3.5 w-3.5" />
          Animate your meme
        </p>
        <p>Turn your finished meme into a short looping video using AI. Make sure your text layers are set before generating.</p>
      </div>

      {/* Generate button */}
      <Button
        className="w-full gap-2 h-10"
        onClick={handleGenerate}
        disabled={isGenerating || !imageLoaded}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {job ? STATUS_LABELS[job.status] ?? "Processing..." : "Starting..."}
          </>
        ) : (
          <>
            <Film className="h-4 w-4" />
            Animate This Meme
          </>
        )}
      </Button>

      {/* Progress indicator */}
      {isGenerating && job && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{STATUS_LABELS[job.status] ?? job.status}</span>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: job.status === "starting" ? "20%" : job.status === "processing" ? "70%" : "100%",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">This may take 30–90 seconds.</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-7" onClick={reset}>
            <RefreshCw className="h-3 w-3" />
            Try again
          </Button>
        </div>
      )}

      {/* Result */}
      {job?.status === "succeeded" && job.outputUrl && (
        <VideoResult url={job.outputUrl} />
      )}
    </div>
  )
}
