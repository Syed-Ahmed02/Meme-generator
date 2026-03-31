"use client"

import { useState } from "react"
import { Download, RotateCcw, RotateCw, ZoomIn, ZoomOut, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { useEditorStore } from "@/hooks/use-editor-store"
import { useCanvasExport } from "@/hooks/use-canvas-export"
import type Konva from "konva"

interface CanvasToolbarProps {
  stageRef: React.RefObject<Konva.Stage | null>
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  imageLoaded: boolean
}

export function CanvasToolbar({
  stageRef,
  zoom,
  onZoomIn,
  onZoomOut,
  imageLoaded,
}: CanvasToolbarProps) {
  const { undo, redo } = useEditorStore()
  const { downloadPNG, copyToClipboard } = useCanvasExport(stageRef)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyToClipboard()
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" onClick={undo} className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
          }
        />
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" onClick={redo} className="h-8 w-8">
              <RotateCw className="h-4 w-4" />
            </Button>
          }
        />
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" onClick={onZoomOut} className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
          }
        />
        <TooltipContent>Zoom out</TooltipContent>
      </Tooltip>

      <span className="text-xs text-muted-foreground w-10 text-center font-mono">
        {Math.round(zoom * 100)}%
      </span>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" onClick={onZoomIn} className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
          }
        />
        <TooltipContent>Zoom in</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!imageLoaded}
              className="h-8 w-8"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          }
        />
        <TooltipContent>{copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => downloadPNG()}
              disabled={!imageLoaded}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          }
        />
        <TooltipContent>Download PNG</TooltipContent>
      </Tooltip>
    </div>
  )
}
