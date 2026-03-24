"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Stage, Layer, Image as KonvaImage } from "react-konva"
import useImage from "use-image"
import { useEditorStore } from "@/hooks/use-editor-store"
import { TextLayerComponent } from "./text-layer"
import type Konva from "konva"

interface MemeCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>
}

export function MemeCanvas({ stageRef }: MemeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { template, layers, selectedLayerId, selectLayer } = useEditorStore()
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 })
  const [scale, setScale] = useState(1)

  const proxyUrl = template
    ? `/api/proxy/image?url=${encodeURIComponent(template.url)}`
    : ""

  const [image, imageStatus] = useImage(proxyUrl, "anonymous")

  const updateDimensions = useCallback(() => {
    if (!containerRef.current || !template) return
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const aspectRatio = template.width / template.height
    let w = containerWidth
    let h = w / aspectRatio
    if (h > containerHeight) {
      h = containerHeight
      w = h * aspectRatio
    }
    const s = w / template.width
    setDimensions({ width: w, height: h })
    setScale(s)
  }, [template])

  useEffect(() => {
    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [updateDimensions])

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-muted/30 overflow-hidden"
      style={{ minHeight: 0 }}
    >
      {imageStatus === "loading" && (
        <div className="text-sm text-muted-foreground animate-pulse">Loading meme...</div>
      )}
      {imageStatus === "failed" && (
        <div className="text-sm text-destructive">Failed to load image</div>
      )}
      {imageStatus === "loaded" && image && (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={(e) => {
            if (e.target === e.target.getStage()) selectLayer(null)
          }}
          onTap={(e) => {
            if (e.target === e.target.getStage()) selectLayer(null)
          }}
          className="shadow-2xl"
        >
          <Layer>
            <KonvaImage
              image={image}
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              listening={false}
            />
            {layers.map((layer) => (
              <TextLayerComponent
                key={layer.id}
                layer={{
                  ...layer,
                  x: layer.x * scale,
                  y: layer.y * scale,
                  width: layer.width * scale,
                  fontSize: layer.fontSize * scale,
                }}
                isSelected={selectedLayerId === layer.id}
                onSelect={() => selectLayer(layer.id)}
                stageScale={scale}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
