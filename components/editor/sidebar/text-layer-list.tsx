"use client"

import { nanoid } from "nanoid"
import { Plus, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditorStore } from "@/hooks/use-editor-store"
import { cn } from "@/lib/utils"
import type { TextLayer } from "@/lib/types"

export function TextLayerList() {
  const { layers, selectedLayerId, selectLayer, deleteLayer, addLayer, template } =
    useEditorStore()

  function handleAdd() {
    const newLayer: TextLayer = {
      id: nanoid(),
      text: "New Text",
      x: template ? template.width / 2 - 150 : 50,
      y: template ? template.height / 2 - 24 : 50,
      width: 300,
      fontSize: 48,
      fontFamily: "Impact",
      fontStyle: "normal",
      fill: "#ffffff",
      stroke: "#000000",
      strokeWidth: 2,
      align: "center",
    }
    addLayer(newLayer)
    selectLayer(newLayer.id)
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <Button onClick={handleAdd} size="sm" className="w-full gap-2 h-8">
        <Plus className="h-3.5 w-3.5" />
        Add Text Layer
      </Button>

      {layers.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No text layers yet. Add one above.
        </p>
      ) : (
        <ScrollArea className="max-h-48">
          <div className="space-y-1">
            {layers.map((layer, i) => (
              <div
                key={layer.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
                  selectedLayerId === layer.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted"
                )}
                onClick={() => selectLayer(layer.id)}
              >
                <Type className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate font-medium text-xs">
                  {layer.text || `Layer ${i + 1}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteLayer(layer.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
