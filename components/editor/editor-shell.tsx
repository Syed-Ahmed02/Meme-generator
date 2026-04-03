"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { nanoid } from "nanoid"
import { Button } from "@/components/ui/button"
import { CanvasToolbar } from "./canvas/canvas-toolbar"
import { EditorSidebar } from "./sidebar/editor-sidebar"
import { AiChatPanel } from "./ai-chat/ai-chat-panel"
import { VideoPanel } from "./video/video-panel"
import { useEditorStore } from "@/hooks/use-editor-store"
import type { MemeTemplate, TextLayer } from "@/lib/types"
import type Konva from "konva"
import useImage from "use-image"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Show, UserButton } from "@clerk/nextjs"

// Dynamically import MemeCanvas so Konva never runs on the server
const MemeCanvas = dynamic(
  () => import("./canvas/meme-canvas").then((m) => m.MemeCanvas),
  { ssr: false }
)

interface EditorShellProps {
  template: MemeTemplate
}

export function EditorShell({ template }: EditorShellProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [zoom, setZoom] = useState(1)
  const { setTemplate, setLayers, selectedLayerId, deleteLayer, selectLayer, layers } =
    useEditorStore()

  // Convex: load saved draft + auto-save
  const savedDraft = useQuery(api.memes.getDraft, { templateId: template.id })
  const upsertDraft = useMutation(api.memes.upsertDraft)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [draftReady, setDraftReady] = useState(false)

  // Check image loaded status for gating export
  const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(template.url)}`
  const [, imageStatus] = useImage(proxyUrl, "anonymous")
  const imageLoaded = imageStatus === "loaded"

  // Initialise store on mount
  useEffect(() => {
    setTemplate(template)

    const defaultLayers: TextLayer[] = [
      {
        id: nanoid(),
        text: "TOP TEXT",
        x: template.width * 0.05,
        y: template.height * 0.04,
        width: template.width * 0.9,
        fontSize: Math.round(template.height * 0.1),
        fontFamily: "Impact",
        fontStyle: "normal",
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
        align: "center",
      },
      {
        id: nanoid(),
        text: "BOTTOM TEXT",
        x: template.width * 0.05,
        y: template.height * 0.84,
        width: template.width * 0.9,
        fontSize: Math.round(template.height * 0.1),
        fontFamily: "Impact",
        fontStyle: "normal",
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
        align: "center",
      },
    ]
    setLayers(defaultLayers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id])

  // Mark draft query as resolved and restore saved layers
  useEffect(() => {
    if (savedDraft === undefined) return
    setDraftReady(true)
    if (savedDraft?.layers?.length) {
      setLayers(savedDraft.layers as TextLayer[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedDraft])

  // Auto-save layers (debounced 1.5s, only after draft query has resolved)
  useEffect(() => {
    if (!draftReady || !layers.length) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      upsertDraft({ templateId: template.id, templateName: template.name, layers })
    }, 1500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, draftReady])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === "input" || tag === "textarea") return

      if ((e.key === "Delete" || e.key === "Backspace") && selectedLayerId) {
        e.preventDefault()
        deleteLayer(selectedLayerId)
      }
      if (e.key === "Escape") {
        selectLayer(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedLayerId, deleteLayer, selectLayer])

  function handleZoomIn() {
    setZoom((z) => Math.min(z + 0.1, 3))
  }
  function handleZoomOut() {
    setZoom((z) => Math.max(z - 0.1, 0.2))
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Gallery
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm font-semibold truncate">{template.name}</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono hidden sm:block">
            {template.width} × {template.height}
          </span>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas area */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <CanvasToolbar
            stageRef={stageRef}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            imageLoaded={imageLoaded}
          />
          <MemeCanvas stageRef={stageRef} />
        </div>

        {/* Sidebar */}
        <EditorSidebar
          stageRef={stageRef}
          imageLoaded={imageLoaded}
          aiPanel={<AiChatPanel />}
          videoPanel={<VideoPanel stageRef={stageRef} imageLoaded={imageLoaded} />}
        />
      </div>
    </div>
  )
}
