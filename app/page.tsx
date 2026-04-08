import { Suspense } from "react"
import { Laugh, MessageSquare } from "lucide-react"
import Link from "next/link"
import { MemeGallery } from "@/components/gallery/meme-gallery"
import { MemeGallerySkeleton } from "@/components/gallery/meme-gallery-skeleton"
import type { MemeTemplate } from "@/lib/types"
import { AuthButtons } from "@/components/auth/auth-buttons"

async function getInitialMemes(): Promise<{
  memes: MemeTemplate[]
  nextCursor: string
}> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/memes`,
      { cache: "no-store" }
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    return { memes: data.memes ?? [], nextCursor: data.nextCursor ?? "" }
  } catch {
    return { memes: [], nextCursor: "" }
  }
}

export default async function Page() {
  const { memes, nextCursor } = await getInitialMemes()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Laugh className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">MemeForge</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground font-mono hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">d</kbd> to toggle dark mode
            </p>
            <Link href="/chat">
              <button className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                <MessageSquare className="h-3.5 w-3.5" />
                Meme Chat
              </button>
            </Link>
            <AuthButtons />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Create memes that{" "}
            <span className="text-primary">actually</span> slap
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pick a template, edit with a Figma-like canvas, or let AI write the
            perfect caption for you.
          </p>
        </div>

        <Suspense fallback={<MemeGallerySkeleton />}>
          <MemeGallery initialMemes={memes} initialNextCursor={nextCursor} />
        </Suspense>
      </div>
    </div>
  )
}
