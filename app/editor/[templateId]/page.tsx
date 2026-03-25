import dynamic from "next/dynamic"
import { notFound } from "next/navigation"
import { FALLBACK_MEMES } from "@/lib/memes-fallback"
import type { MemeTemplate } from "@/lib/types"

const EditorShell = dynamic(
  () => import("@/components/editor/editor-shell").then((m) => m.EditorShell),
  { ssr: false }
)

async function getTemplate(id: string): Promise<MemeTemplate | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/memes`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    return (data.memes as MemeTemplate[]).find((m) => m.id === id) ?? null
  } catch {
    return FALLBACK_MEMES.find((m) => m.id === id) ?? null
  }
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { templateId } = await params
  const template = await getTemplate(templateId)

  if (!template) notFound()

  return <EditorShell template={template} />
}
