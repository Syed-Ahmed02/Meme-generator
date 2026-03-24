"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Copy, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { MemeTemplate } from "@/lib/types"

interface MemeCardProps {
  meme: MemeTemplate
}

export function MemeCard({ meme }: MemeCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(meme.url)}`
      const res = await fetch(proxyUrl)
      const blob = await res.blob()
      const pngBlob = blob.type === "image/png" ? blob : await convertToPng(blob)
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed", err)
    }
  }

  return (
    <Card className="group relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={meme.url}
            alt={meme.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <Link href={`/editor/${meme.id}`}>
              <Button size="sm" className="gap-1.5 font-medium">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 font-medium"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-foreground truncate leading-tight">
            {meme.name}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

async function convertToPng(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("No canvas context"))
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((b) => {
        URL.revokeObjectURL(url)
        if (b) resolve(b)
        else reject(new Error("Canvas toBlob failed"))
      }, "image/png")
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")) }
    img.src = url
  })
}
