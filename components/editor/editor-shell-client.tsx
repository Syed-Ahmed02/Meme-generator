"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import type { MemeTemplate } from "@/lib/types"

const EditorShell = dynamic(
  () => import("./editor-shell").then((m) => m.EditorShell),
  { ssr: false }
)

export function EditorShellClient({ template }: { template: MemeTemplate }) {
  return (
    <Suspense>
      <EditorShell template={template} />
    </Suspense>
  )
}
