"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useEditorStore } from "@/hooks/use-editor-store"
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

const FONT_FAMILIES = [
  "Impact",
  "Arial",
  "Comic Sans MS",
  "Georgia",
  "Helvetica",
  "Times New Roman",
  "Verdana",
  "Courier New",
]

export function TextLayerControls() {
  const { layers, selectedLayerId, updateLayer } = useEditorStore()
  const layer = layers.find((l) => l.id === selectedLayerId)

  if (!layer) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        Select a text layer to edit its properties
      </div>
    )
  }

  function update(updates: Parameters<typeof updateLayer>[1]) {
    updateLayer(layer!.id, updates)
  }

  const isBold = layer.fontStyle.includes("bold")
  const isItalic = layer.fontStyle.includes("italic")

  function toggleBold() {
    const styles = layer.fontStyle.split(" ").filter(Boolean)
    const next = isBold ? styles.filter((s) => s !== "bold") : [...styles, "bold"]
    update({ fontStyle: next.join(" ") || "normal" })
  }

  function toggleItalic() {
    const styles = layer.fontStyle.split(" ").filter(Boolean)
    const next = isItalic
      ? styles.filter((s) => s !== "italic")
      : [...styles, "italic"]
    update({ fontStyle: next.join(" ") || "normal" })
  }

  return (
    <div className="p-3 space-y-4">
      {/* Text content */}
      <div className="space-y-1.5">
        <Label className="text-xs">Text</Label>
        <Input
          value={layer.text}
          onChange={(e) => update({ text: e.target.value })}
          className="h-8 text-sm"
          placeholder="Enter text..."
        />
      </div>

      <Separator />

      {/* Font family */}
      <div className="space-y-1.5">
        <Label className="text-xs">Font</Label>
        <Select value={layer.fontFamily} onValueChange={(v) => update({ fontFamily: v })}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font size */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Size</Label>
          <span className="text-xs text-muted-foreground font-mono">{layer.fontSize}px</span>
        </div>
        <Slider
          min={8}
          max={120}
          step={1}
          value={[layer.fontSize]}
          onValueChange={([v]) => update({ fontSize: v })}
        />
      </div>

      {/* Style toggles */}
      <div className="space-y-1.5">
        <Label className="text-xs">Style</Label>
        <div className="flex gap-1">
          <Button
            variant={isBold ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleBold}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={isItalic ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleItalic}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-1.5">
        <Label className="text-xs">Alignment</Label>
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((a) => (
            <Button
              key={a}
              variant={layer.align === a ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => update({ align: a })}
            >
              {a === "left" && <AlignLeft className="h-3.5 w-3.5" />}
              {a === "center" && <AlignCenter className="h-3.5 w-3.5" />}
              {a === "right" && <AlignRight className="h-3.5 w-3.5" />}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Text color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.fill}
              onChange={(e) => update({ fill: e.target.value })}
              className="h-8 w-8 rounded cursor-pointer border border-border"
            />
            <span className="text-xs font-mono text-muted-foreground">{layer.fill}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Stroke color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.stroke}
              onChange={(e) => update({ stroke: e.target.value })}
              className="h-8 w-8 rounded cursor-pointer border border-border"
            />
            <span className="text-xs font-mono text-muted-foreground">{layer.stroke}</span>
          </div>
        </div>
      </div>

      {/* Stroke width */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Stroke width</Label>
          <span className="text-xs text-muted-foreground font-mono">{layer.strokeWidth}px</span>
        </div>
        <Slider
          min={0}
          max={10}
          step={0.5}
          value={[layer.strokeWidth]}
          onValueChange={([v]) => update({ strokeWidth: v })}
        />
      </div>
    </div>
  )
}
