"use client"

import { useState } from "react"
import { Download, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCanvasExport } from "@/hooks/use-canvas-export"
import type Konva from "konva"

interface ExportControlsProps {
  stageRef: React.RefObject<Konva.Stage | null>
  imageLoaded: boolean
}

export function ExportControls({ stageRef, imageLoaded }: ExportControlsProps) {
  const [copied, setCopied] = useState(false)
  const { downloadPNG, copyToClipboard } = useCanvasExport(stageRef)

  async function handleCopy() {
    const ok = await copyToClipboard()
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-3 space-y-2">
      <Button
        className="w-full gap-2 h-9"
        onClick={() => downloadPNG()}
        disabled={!imageLoaded}
      >
        <Download className="h-4 w-4" />
        Download PNG
      </Button>
      <Button
        variant="secondary"
        className="w-full gap-2 h-9"
        onClick={handleCopy}
        disabled={!imageLoaded}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </>
        )}
      </Button>
    </div>
  )
}
