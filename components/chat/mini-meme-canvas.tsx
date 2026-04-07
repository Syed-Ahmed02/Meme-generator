"use client"

import { Stage, Layer, Image as KonvaImage, Text } from "react-konva"
import useImage from "use-image"

interface MiniMemeCanvasProps {
  templateUrl: string
  templateWidth: number
  templateHeight: number
  topText: string
  bottomText: string
  maxWidth?: number
}

export function MiniMemeCanvas({
  templateUrl,
  templateWidth,
  templateHeight,
  topText,
  bottomText,
  maxWidth = 320,
}: MiniMemeCanvasProps) {
  const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(templateUrl)}`
  const [image, status] = useImage(proxyUrl, "anonymous")

  const scale = maxWidth / templateWidth
  const width = maxWidth
  const height = Math.round(templateHeight * scale)

  const fontSize = Math.round(templateHeight * 0.1 * scale)
  const textWidth = templateWidth * 0.9 * scale
  const textX = templateWidth * 0.05 * scale
  const strokeWidth = 2 * scale

  if (status === "loading") {
    return (
      <div
        className="rounded-lg bg-muted animate-pulse"
        style={{ width, height }}
      />
    )
  }

  if (status === "failed" || !image) {
    return (
      <div
        className="rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground"
        style={{ width, height }}
      >
        Failed to load
      </div>
    )
  }

  return (
    <Stage width={width} height={height} listening={false}>
      <Layer>
        <KonvaImage image={image} x={0} y={0} width={width} height={height} listening={false} />
        <Text
          text={topText}
          x={textX}
          y={templateHeight * 0.04 * scale}
          width={textWidth}
          fontSize={fontSize}
          fontFamily="Impact"
          fontStyle="normal"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={strokeWidth}
          align="center"
          shadowColor="black"
          shadowBlur={0}
          shadowOffset={{ x: 2 * scale, y: 2 * scale }}
          shadowOpacity={0.3}
          wrap="word"
          listening={false}
        />
        <Text
          text={bottomText}
          x={textX}
          y={templateHeight * 0.84 * scale}
          width={textWidth}
          fontSize={fontSize}
          fontFamily="Impact"
          fontStyle="normal"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={strokeWidth}
          align="center"
          shadowColor="black"
          shadowBlur={0}
          shadowOffset={{ x: 2 * scale, y: 2 * scale }}
          shadowOpacity={0.3}
          wrap="word"
          listening={false}
        />
      </Layer>
    </Stage>
  )
}
