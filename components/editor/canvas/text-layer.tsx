"use client"

import { useEffect, useRef } from "react"
import { Text, Transformer } from "react-konva"
import { useEditorStore } from "@/hooks/use-editor-store"
import type { TextLayer as TextLayerType } from "@/lib/types"
import type Konva from "konva"

interface TextLayerProps {
  layer: TextLayerType
  isSelected: boolean
  onSelect: () => void
  stageScale: number
}

export function TextLayerComponent({ layer, isSelected, onSelect, stageScale }: TextLayerProps) {
  const textRef = useRef<Konva.Text>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const { updateLayer, pushHistory } = useEditorStore()

  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <Text
        ref={textRef}
        text={layer.text}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        fontSize={layer.fontSize}
        fontFamily={layer.fontFamily}
        fontStyle={layer.fontStyle}
        fill={layer.fill}
        stroke={layer.stroke}
        strokeWidth={layer.strokeWidth / stageScale}
        align={layer.align as "left" | "center" | "right"}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={() => pushHistory()}
        onDragEnd={(e) => {
          updateLayer(layer.id, {
            x: e.target.x() / stageScale,
            y: e.target.y() / stageScale,
          })
        }}
        onTransformStart={() => pushHistory()}
        onTransformEnd={(e) => {
          const node = e.target as Konva.Text
          const scaleX = node.scaleX()
          node.scaleX(1)
          node.scaleY(1)
          updateLayer(layer.id, {
            x: node.x() / stageScale,
            y: node.y() / stageScale,
            width: Math.max(50, (node.width() * scaleX) / stageScale),
          })
        }}
        shadowColor="black"
        shadowBlur={0}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.3}
        wrap="word"
        ellipsis={false}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={["middle-left", "middle-right"]}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50) return oldBox
            return newBox
          }}
        />
      )}
    </>
  )
}
