import type Konva from "konva"
import type { RefObject } from "react"

export function useCanvasExport(stageRef: RefObject<Konva.Stage | null>) {
  function getDataUrl(): string | null {
    if (!stageRef.current) return null
    return stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/png" })
  }

  function downloadPNG(filename = "meme.png") {
    const dataUrl = getDataUrl()
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = filename
    a.click()
  }

  async function copyToClipboard(): Promise<boolean> {
    const dataUrl = getDataUrl()
    if (!dataUrl) return false
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ])
      return true
    } catch {
      return false
    }
  }

  return { downloadPNG, copyToClipboard, getDataUrl }
}
