import { notFound } from "next/navigation"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { EditorShellClient } from "@/components/editor/editor-shell-client"
import type { MemeTemplate } from "@/lib/types"

async function getTemplate(id: string): Promise<MemeTemplate | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (convexUrl) {
    try {
      const convex = new ConvexHttpClient(convexUrl)
      const template = await convex.query(api.templates.getTemplateByTenorId, {
        tenorId: id,
      })
      if (template) {
        return {
          id: template.tenorId,
          name: template.name,
          url: template.url,
          previewUrl: template.previewUrl,
          width: template.width,
          height: template.height,
          boxCount: 2,
          tags: template.tags,
        }
      }
    } catch {
      // fall through to API fetch
    }
  }

  // Fallback: fetch from Tenor via API route and cache in Convex
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/memes/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    return data.meme ?? null
  } catch {
    return null
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

  return <EditorShellClient template={template} />
}
