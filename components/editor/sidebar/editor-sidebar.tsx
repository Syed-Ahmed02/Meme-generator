"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Layers, Bot, Video } from "lucide-react"
import { TextLayerList } from "./text-layer-list"
import { TextLayerControls } from "./text-layer-controls"
import { ExportControls } from "./export-controls"
import type Konva from "konva"

interface EditorSidebarProps {
  stageRef: React.RefObject<Konva.Stage | null>
  imageLoaded: boolean
  aiPanel: React.ReactNode
  videoPanel: React.ReactNode
}

export function EditorSidebar({ stageRef, imageLoaded, aiPanel, videoPanel }: EditorSidebarProps) {
  return (
    <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full">
      <Tabs defaultValue="layers" className="flex flex-col flex-1 min-h-0">
        <TabsList className="rounded-none border-b border-border h-10 p-0 bg-transparent shrink-0">
          <TabsTrigger
            value="layers"
            className="flex-1 h-full rounded-none gap-1.5 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <Layers className="h-3.5 w-3.5" />
            Layers
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="flex-1 h-full rounded-none gap-1.5 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <Bot className="h-3.5 w-3.5" />
            AI
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="flex-1 h-full rounded-none gap-1.5 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <Video className="h-3.5 w-3.5" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layers" className="flex-1 flex flex-col min-h-0 mt-0">
          <ScrollArea className="flex-1">
            <TextLayerList />
            <Separator />
            <TextLayerControls />
            <Separator />
            <ExportControls stageRef={stageRef} imageLoaded={imageLoaded} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 mt-0 overflow-hidden">
          {aiPanel}
        </TabsContent>

        <TabsContent value="video" className="flex-1 flex flex-col min-h-0 mt-0 overflow-hidden">
          {videoPanel}
        </TabsContent>
      </Tabs>
    </div>
  )
}
