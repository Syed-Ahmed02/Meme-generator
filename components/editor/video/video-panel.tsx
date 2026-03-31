"use client"

import { useState } from "react"
import { Film, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { VideoResult } from "./video-result"
import { useVideoGeneration } from "@/hooks/use-video-generation"
import { useCanvasExport } from "@/hooks/use-canvas-export"
import { cn } from "@/lib/utils"
import type Konva from "konva"

const DEFAULT_VIDEO_PROMPT =
  "Subtle motion and parallax, keep the meme text sharp and readable, short playful energy"

function moderationHint(errorText: string): string | null {
  if (/sensitive|E005|flagged as sensitive/i.test(errorText)) {
    return "The video provider blocked this run (often the image or prompt). Try a different template or meme image, use a neutral motion prompt (e.g. “slow zoom, soft lighting”), and avoid graphic or edgy source images."
  }
  return null
}

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
  const [prompt, setPrompt] = useState(DEFAULT_VIDEO_PROMPT)

  async function handleGenerate() {
    const dataUrl = getDataUrl()
    if (!dataUrl) return
    await generateVideo(dataUrl, { prompt: prompt.trim() || undefined })
  }

  const sensitiveHint = error ? moderationHint(error) : null

  return (
    <div className="flex flex-col h-full p-3 space-y-4">
      {/* Explainer */}
      <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs text-muted-foreground leading-relaxed">
        <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
          <Film className="h-3.5 w-3.5" />
          Animate your meme
        </p>
        <p>
          Turn your finished meme into a short video with MiniMax Hailuo 2.3 (via Replicate). Your canvas
          is sent as the first frame; set text layers, then describe the motion below. Providers may block
          some images or prompts automatically.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="video-prompt" className="text-xs text-muted-foreground font-normal">
          Motion prompt
        </Label>
        <textarea
          id="video-prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          className={cn(
            "w-full min-h-18 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm",
            "placeholder:text-muted-foreground outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
          )}
          placeholder="Describe camera motion, mood, or effects..."
        />
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
          <p className="text-xs text-muted-foreground">Rendering can take a few minutes. Keep this tab open.</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="wrap-break-word">{error}</span>
          </div>
          {sensitiveHint && (
            <p className="text-xs text-muted-foreground leading-relaxed">{sensitiveHint}</p>
          )}
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
