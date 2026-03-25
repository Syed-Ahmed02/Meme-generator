"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoResultProps {
  url: string
}

export function VideoResult({ url }: VideoResultProps) {
  function handleDownload() {
    const a = document.createElement("a")
    a.href = url
    a.download = "meme-video.mp4"
    a.target = "_blank"
    a.click()
  }

  return (
    <div className="space-y-3">
      <video
        src={url}
        controls
        autoPlay
        loop
        className="w-full rounded-lg border border-border"
        style={{ maxHeight: 240 }}
      />
      <Button
        variant="secondary"
        className="w-full gap-2 h-9"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
        Download Video
      </Button>
    </div>
  )
}
